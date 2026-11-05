<template>
  <div class="page stack">
    <section class="card filters">
      <input v-model="keyword" class="field" placeholder="搜索标题 / 发布人" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="canPublish" class="btn btn-primary" type="button" @click="openCreate">发布</button>
    </section>

    <section class="card table-card">
      <article v-for="item in ordered" :key="item.id" class="news news-row row-pick" :class="{ picked: pickedId === item.id }" @click="pickedId = item.id">
        <div class="news-main">
          <strong>
            <span v-if="item.pinned" class="pill pill-pin" style="margin-right: 8px">置顶</span>
            {{ item.title }}
          </strong>
          <small class="muted">{{ item.publishedAt }} · {{ scopeTextOf(item) }} · {{ item.author }}</small>
        </div>
        <div class="news-side">
          <span class="pill" :class="item.read ? 'pill-muted' : 'pill-info'">
            {{ item.read ? '已读' : '未读' }}
          </span>
          <button class="linkish" type="button" @click.stop="openDetail(item)">详情</button>
          <button v-if="canEdit(item)" class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
          <button v-if="auth.can('announcement:top')" class="linkish" type="button" @click.stop="togglePin(item)">
            {{ item.pinned ? '取消置顶' : '置顶' }}
          </button>
        </div>
      </article>
      <p v-if="!ordered.length" class="empty">还没有公告</p>
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <div v-if="preview" class="preview-grid">
        <div><span class="k">标题</span><span class="v">{{ preview.title || '—' }}</span></div>
        <div><span class="k">范围</span><span class="v">{{ preview.scope || '—' }}</span></div>
        <div><span class="k">发布人</span><span class="v">{{ preview.author || auth.user?.name || '—' }}</span></div>
        <div><span class="k">时间</span><span class="v num">{{ preview.publishedAt || (open ? '待发布' : '—') }}</span></div>
        <div><span class="k">置顶</span><span class="v">{{ preview.pinned ? '是' : '否' }}</span></div>
        <div><span class="k">正文</span><span class="v">{{ preview.body || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一条公告，或填写发布表单后在这里预览。</p>
    </section>

    <div v-if="current" class="modal-mask" @click.self="current = null">
      <div class="modal-card" role="dialog">
        <div class="modal-head">
          <h3>{{ current.title }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="current = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <p class="sub" style="margin-top: 0">{{ current.publishedAt }} · {{ scopeTextOf(current) }} · {{ current.author }}</p>
        <p style="line-height: 1.7; margin: 12px 0 18px">{{ current.body }}</p>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" @click="mark">知道了</button>
        </div>
      </div>
    </div>

    <div v-if="open" class="modal-mask" @click.self="open = false">
      <form class="modal-card" @submit.prevent="publish">
        <div class="modal-head">
          <h3>{{ draft.id ? '编辑公告' : '发布公告' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="open = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">标题</label>
          <input v-model="draft.title" class="field" required />
          <label class="field-label">范围</label>
          <select v-model="draft.scopeKey" class="select">
            <option v-for="item in scopeOptions" :key="item.key" :value="item.key">{{ item.label }}</option>
          </select>
          <label class="field-label">正文</label>
          <textarea v-model="draft.body" class="textarea" required></textarea>
          <label class="check"><input v-model="draft.pinned" type="checkbox" /> 置顶</label>
          <p v-if="formError" :class="isLoadHint(formError) ? 'load-hint' : 'error-text'">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="closeEditor">取消</button>
            <button class="btn btn-primary" type="submit" :disabled="saving">{{ draft.id ? '保存' : '发布' }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { createAnnouncement, fetchAnnouncement, fetchAnnouncements, markAnnouncementRead, pinAnnouncement, updateAnnouncement } from '../api/announcement.js'
import { fetchGrades } from '../api/org.js'
import { fetchClasses } from '../api/student.js'
import { announcementWritePayload, validateAnnouncement } from '../domain/writePayloads.js'
import { useViewport } from '../composables/useViewport.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { isLoadHint, scopeLabel } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const { isMobile } = useViewport()
const open = ref(false)
const current = ref(null)
const formError = ref('')
const loadError = ref('')

function netHint(message) {
  return isLoadHint(message)
}
const items = ref([])
const keyword = ref('')
const pickedId = ref('')
const grades = ref([])
const classes = ref([])
const saving = ref(false)
const draft = reactive({ id: '', title: '', body: '', scopeKey: 'ALL', pinned: false, status: 1 })
const userId = computed(() => auth.user?.id || '')
const canPublish = computed(() => auth.can('announcement:publish') && !isMobile.value)
const scopeText = computed(() => {
  if (auth.user?.role === 'TEACHER') return `可阅读全校公告；发布仅限 ${scopeLabel(auth.user, auth.user.classNames || [])}`
  if (auth.user?.role === 'STUDENT') return '全校公告 · 只读'
  return '全校'
})

const visibleClasses = computed(() => {
  if (auth.user?.role !== 'TEACHER') return classes.value
  const ids = (auth.user.classIds || []).map((item) => Number(item)).filter((item) => item > 0)
  const names = auth.user.classNames || []
  const matched = classes.value.filter((item) => ids.includes(Number(item.id)) || names.includes(item.name))
  return matched
})

const scopeOptions = computed(() => {
  if (auth.user?.role === 'TEACHER') {
    return visibleClasses.value.map((item) => ({ key: `CLASS:${item.id}`, label: item.name }))
  }
  return [
    { key: 'ALL', label: '全校' },
    ...grades.value.map((item) => ({ key: `GRADE:${item.id}`, label: item.gradeName })),
    ...classes.value.map((item) => ({ key: `CLASS:${item.id}`, label: item.className || item.name }))
  ]
})

function scopeTextOf(item) {
  if (!item) return '—'
  if (item.scopeType === 'GRADE') {
    const names = (item.scopeIds || []).map((id) => grades.value.find((row) => String(row.id) === String(id))?.gradeName || `年级#${id}`)
    return names.length ? names.join('、') : '年级'
  }
  if (item.scopeType === 'CLASS') {
    const names = (item.scopeIds || []).map((id) => classes.value.find((row) => String(row.id) === String(id))?.name || `班级#${id}`)
    return names.length ? names.join('、') : '班级'
  }
  return '全校'
}

function canEdit(item) {
  if (!canPublish.value) return false
  if (auth.user?.role === 'ADMIN' || auth.user?.role === 'ACADEMIC') return true
  return item.publisherId != null && String(item.publisherId) === String(auth.user?.id)
}

const ordered = computed(() => {
  const query = keyword.value.trim()
  return [...items.value]
    .filter((item) => !query || `${item.title}${item.author}`.includes(query))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.publishedAt).localeCompare(String(a.publishedAt)))
})
const preview = computed(() => {
  if (open.value) {
    const option = scopeOptions.value.find((item) => item.key === draft.scopeKey)
    return {
      title: draft.title,
      scope: option?.label || '全校',
      author: auth.user?.name || '',
      body: draft.body,
      pinned: draft.pinned,
      publishedAt: draft.id ? '已发布' : ''
    }
  }
  const item = ordered.value.find((row) => row.id === pickedId.value) || current.value || ordered.value[0] || null
  if (!item) return null
  return { ...item, scope: scopeTextOf(item) }
})

async function load() {
  loadError.value = ''
  try {
    items.value = await fetchAnnouncements()
  } catch (error) {
    items.value = []
    loadError.value = error.message || '公告加载失败'
  }
}

onMounted(async () => {
  try {
    grades.value = await fetchGrades()
  } catch {
    grades.value = []
  }
  try {
    classes.value = await fetchClasses()
  } catch {
    classes.value = []
  }
  await load()
})

function openCreate() {
  formError.value = ''
  draft.id = ''
  draft.title = ''
  draft.body = ''
  draft.pinned = false
  draft.status = 1
  draft.scopeKey = scopeOptions.value[0]?.key || 'ALL'
  open.value = true
}

function closeEditor() {
  open.value = false
  draft.id = ''
  draft.title = ''
  draft.body = ''
  draft.pinned = false
  draft.status = 1
  draft.scopeKey = scopeOptions.value[0]?.key || 'ALL'
}

function scopeKeyOf(item) {
  if (item.scopeType === 'GRADE' && item.scopeIds?.[0]) return `GRADE:${item.scopeIds[0]}`
  if (item.scopeType === 'CLASS' && item.scopeIds?.[0]) return `CLASS:${item.scopeIds[0]}`
  return scopeOptions.value[0]?.key || 'ALL'
}

function openEdit(item) {
  formError.value = ''
  draft.id = item.id
  draft.title = item.title
  draft.body = item.body
  draft.pinned = item.pinned
  draft.status = item.status ?? 1
  draft.scopeKey = scopeKeyOf(item)
  open.value = true
}

function draftScope() {
  const key = draft.scopeKey || 'ALL'
  if (key === 'ALL') return { scopeType: 'ALL', scopeIds: [] }
  const [scopeType, id] = key.split(':')
  return { scopeType, scopeIds: [Number(id)] }
}

async function openDetail(item) {
  current.value = item
  try {
    await markAnnouncementRead(item.id)
    item.read = true
    const detail = await fetchAnnouncement(item.id)
    Object.assign(item, detail, { read: true })
    current.value = item
  } catch (error) {
    ui.toast(error.message || '标记已读失败', 'error')
  }
}

function mark() {
  current.value = null
}

async function publish() {
  formError.value = ''
  const scope = draftScope()
  const form = {
    title: draft.title,
    body: draft.body,
    pinned: draft.pinned,
    status: draft.status || 1,
    ...scope
  }
  const errors = validateAnnouncement(form)
  if (errors.length) {
    formError.value = errors[0]
    return
  }
  saving.value = true
  try {
    const payload = announcementWritePayload(form)
    if (draft.id) await updateAnnouncement(draft.id, payload)
    else await createAnnouncement(payload)
    ui.toast(draft.id ? '公告已保存' : '公告已发布', 'success')
    closeEditor()
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function togglePin(item) {
  try {
    await pinAnnouncement(item.id, item.pinned ? 0 : 1)
    ui.toast(item.pinned ? '已取消置顶' : '已置顶', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '置顶失败', 'error')
  }
}

watch(scopeOptions, (list) => {
  if (!draft.id && list.length && !list.some((item) => item.key === draft.scopeKey)) draft.scopeKey = list[0].key
}, { immediate: true })

watch(() => route.query.publish, (value) => {
  if (!value) return
  if (canPublish.value) openCreate()
  else if (isMobile.value) ui.toast('请用电脑办理', 'info')
}, { immediate: true })
</script>
