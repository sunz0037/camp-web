<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>校园公告</h1>
        <p>{{ isMobile ? '手机端只浏览，发布请用电脑办理。' : '发布、置顶与已读回执。' }}</p>
        <p class="scope-line">数据范围 · {{ scopeText }}</p>
        <p v-if="loadError" class="error-text">{{ loadError }}</p>
      </div>
      <button v-if="canPublish" class="btn btn-primary" type="button" @click="open = true">发布</button>
    </header>

    <section class="card filters">
      <input v-model="keyword" class="field" placeholder="搜索标题 / 发布人" />
    </section>

    <section class="card table-card">
      <article v-for="item in ordered" :key="item.id" class="news news-row">
        <div class="news-main">
          <strong>
            <span v-if="item.pinned" class="pill pill-pin" style="margin-right: 8px">置顶</span>
            {{ item.title }}
          </strong>
          <small class="muted">{{ item.publishedAt }} · {{ item.scope }} · {{ item.author }}</small>
        </div>
        <div class="news-side">
          <span class="pill" :class="item.read ? 'pill-muted' : 'pill-info'">
            {{ item.read ? '已读' : '未读' }}
          </span>
          <button class="linkish" type="button" @click="openDetail(item)">详情</button>
        </div>
      </article>
      <p v-if="!ordered.length" class="empty">还没有公告</p>
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <dl v-if="preview" class="dl">
        <dt>标题</dt><dd>{{ preview.title || '—' }}</dd>
        <dt>范围</dt><dd>{{ preview.scope || draft.scope || '—' }}</dd>
        <dt>发布人</dt><dd>{{ preview.author || auth.user?.name || '—' }}</dd>
        <dt>正文</dt><dd>{{ preview.body || '—' }}</dd>
      </dl>
      <p v-else class="sub">选择一条公告，或填写发布表单后在这里预览。</p>
    </section>

    <div v-if="current" class="modal-mask" @click.self="current = null">
      <div class="modal-card" role="dialog">
        <div class="modal-head">
          <h3>{{ current.title }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="current = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <p class="sub" style="margin-top: 0">{{ current.publishedAt }} · {{ current.scope }} · {{ current.author }}</p>
        <p style="line-height: 1.7; margin: 12px 0 18px">{{ current.body }}</p>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" @click="mark">知道了</button>
        </div>
      </div>
    </div>

    <div v-if="open" class="modal-mask" @click.self="open = false">
      <form class="modal-card" @submit.prevent="publish">
        <div class="modal-head">
          <h3>发布公告</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="open = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">标题</label>
          <input v-model="draft.title" class="field" required />
          <label class="field-label">范围</label>
          <select v-model="draft.scope" class="select">
            <option v-for="item in scopes" :key="item">{{ item }}</option>
          </select>
          <label class="field-label">正文</label>
          <textarea v-model="draft.body" class="textarea" required></textarea>
          <label class="check"><input v-model="draft.pinned" type="checkbox" /> 置顶</label>
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="open = false">取消</button>
            <button class="btn btn-primary" type="submit">发布</button>
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
import { createAnnouncement, fetchAnnouncement, fetchAnnouncements, markAnnouncementRead } from '../api/announcement.js'
import { useViewport } from '../composables/useViewport.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { scopeLabel } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const { isMobile } = useViewport()
const open = ref(false)
const current = ref(null)
const formError = ref('')
const loadError = ref('')
const items = ref([])
const keyword = ref('')
const draft = reactive({ title: '', body: '', scope: '全校', pinned: false })
const userId = computed(() => auth.user?.id || '')
const canPublish = computed(() => auth.can('announcement:publish') && !isMobile.value)
const scopeText = computed(() => {
  if (auth.user?.role === 'TEACHER') return `可阅读全校公告；发布仅限 ${scopeLabel(auth.user, auth.user.classNames || [])}`
  if (auth.user?.role === 'STUDENT') return '全校公告 · 只读'
  return '全校'
})

const scopes = computed(() => {
  if (auth.user?.role === 'TEACHER' && auth.user.classNames?.length) return auth.user.classNames
  return ['全校']
})

const ordered = computed(() => {
  const query = keyword.value.trim()
  return [...items.value]
    .filter((item) => !query || `${item.title}${item.author}`.includes(query))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.publishedAt).localeCompare(String(a.publishedAt)))
})
const preview = computed(() => current.value || (draft.title || draft.body ? draft : null) || ordered.value[0] || null)

async function load() {
  loadError.value = ''
  try {
    items.value = await fetchAnnouncements()
  } catch (error) {
    items.value = []
    loadError.value = error.message || '公告加载失败'
  }
}

onMounted(load)

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
  try {
    await createAnnouncement({
      title: draft.title.trim(),
      content: draft.body.trim(),
      targetAudience: draft.scope || '全校',
      isTop: draft.pinned ? 1 : 0,
      status: 1
    })
    ui.toast('公告已发布', 'success')
    open.value = false
    draft.title = ''
    draft.body = ''
    draft.pinned = false
    await load()
  } catch (error) {
    formError.value = error.message
  }
}

watch(scopes, (list) => {
  if (!draft.scope && list.length) draft.scope = list[0]
}, { immediate: true })

watch(() => route.query.publish, (value) => {
  if (!value) return
  if (canPublish.value) open.value = true
  else if (isMobile.value) ui.toast('请用电脑办理', 'info')
}, { immediate: true })
</script>
