<template>
  <div class="page stack">
    <section class="card filters filters-wrap">
      <select v-model="status" class="select" aria-label="状态">
        <option value="">全部状态</option>
        <option value="PENDING">待审</option>
        <option value="APPROVED">已批准</option>
        <option value="REJECTED">已拒绝</option>
        <option value="CHECKED_IN">已入校</option>
        <option value="CHECKED_OUT">已离校</option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索访客 / 被访人 / 事由" @keyup.enter="load" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="canWrite" class="btn btn-primary" type="button" @click="openCreate">+ 登记</button>
    </section>

    <div class="status-legend">
      <span>状态</span>
      <span class="pill pill-warn">待审</span>
      <span class="pill pill-on">已批准</span>
      <span class="pill pill-muted">已拒绝</span>
      <span class="pill pill-info">已入校</span>
      <span class="pill pill-ok">已离校</span>
    </div>

    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>访客</th>
              <th>证件</th>
              <th>电话</th>
              <th>事由</th>
              <th>被访人</th>
              <th>预约</th>
              <th>到访 / 离校</th>
              <th>状态</th>
              <th class="ops">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="muted">加载中…</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="9" class="muted">没有符合条件的来访登记</td>
            </tr>
            <tr
              v-for="item in rows"
              v-else
              :key="item.id"
              class="row-pick"
              :class="{ picked: selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <td>{{ item.visitorName }}</td>
              <td class="num">{{ maskId(item.idNo) }}</td>
              <td class="num">{{ maskPhone(item.phone) }}</td>
              <td>{{ item.reason || '—' }}</td>
              <td>{{ item.hostName || '—' }}</td>
              <td class="num">{{ formatDateTime(item.appointmentTime) }}</td>
              <td class="num">{{ visitSpan(item) }}</td>
              <td><span class="pill" :class="statusClass(item.status)">{{ statusText(item.status) }}</span></td>
              <td class="ops">
                <button v-if="canReview && item.status === 'PENDING'" class="linkish" type="button" @click.stop="runAction(item, 'approve')">批准</button>
                <button v-if="canReview && item.status === 'PENDING'" class="link-danger" type="button" @click.stop="runAction(item, 'reject')">拒绝</button>
                <button v-if="canReview && item.status === 'APPROVED'" class="linkish" type="button" @click.stop="runAction(item, 'check-in')">入校</button>
                <button v-if="canReview && item.status === 'CHECKED_IN'" class="linkish" type="button" @click.stop="runAction(item, 'check-out')">离校</button>
                <button v-if="canWrite && (item.status === 'PENDING' || item.status === 'APPROVED')" class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
                <button v-if="canWrite" class="link-danger" type="button" @click.stop="removeVisitor(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-foot">
        <span>共 {{ total }} 条来访 · 显示 {{ rangeText }}</span>
        <div class="pager">
          <button type="button" :disabled="page === 1" @click="page -= 1">上一页</button>
          <template v-for="(n, index) in pageList" :key="n">
            <span v-if="index > 0 && n - pageList[index - 1] > 1">…</span>
            <button type="button" :class="{ active: n === page }" @click="page = n">{{ n }}</button>
          </template>
          <button type="button" :disabled="page === pageCount" @click="page += 1">下一页</button>
        </div>
      </div>
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <div v-if="preview" class="preview-grid">
        <div><span class="k">访客</span><span class="v">{{ preview.visitorName || '—' }}</span></div>
        <div><span class="k">证件</span><span class="v num">{{ editor ? (preview.idNo || '—') : maskId(preview.idNo) }}</span></div>
        <div><span class="k">电话</span><span class="v num">{{ editor ? (preview.phone || '—') : maskPhone(preview.phone) }}</span></div>
        <div><span class="k">事由</span><span class="v">{{ preview.reason || '—' }}</span></div>
        <div><span class="k">被访人</span><span class="v">{{ preview.hostName || '—' }}</span></div>
        <div><span class="k">预约</span><span class="v num">{{ formatDateTime(preview.appointmentTime) }}</span></div>
        <div><span class="k">状态</span><span class="v">{{ editor ? '待审' : statusText(preview.status) }}</span></div>
      </div>
      <p v-else class="sub">选择一条登记，或点击登记后在这里预览。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>{{ editor.id ? '编辑来访登记' : '新增来访登记' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <div class="form-row">
            <div>
              <label class="field-label">访客姓名</label>
              <input v-model="editor.visitorName" class="field" required />
            </div>
            <div>
              <label class="field-label">联系电话</label>
              <input v-model="editor.phone" class="field num" required />
            </div>
          </div>
          <label class="field-label">证件号</label>
          <input v-model="editor.idNo" class="field num" placeholder="身份证或其他证件" />
          <label class="field-label">事由</label>
          <textarea v-model="editor.reason" class="textarea" required></textarea>
          <div class="form-row">
            <div>
              <label class="field-label">被访人</label>
              <input v-model="editor.hostName" class="field" required />
            </div>
            <div>
              <label class="field-label">预约时间</label>
              <input v-model="editor.appointmentTime" class="field" type="datetime-local" required />
            </div>
          </div>
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="editor = null">取消</button>
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { canReviewVisitor, canWriteVisitor } from '../access.js'
import {
  approveVisitor,
  checkInVisitor,
  checkOutVisitor,
  createVisitor,
  deleteVisitor,
  fetchVisitorPage,
  rejectVisitor,
  toVisitorPayload,
  updateVisitor,
  visitorStatusLabel
} from '../api/visitor.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { formatDateTime, maskId, maskPhone, toInputDateTime } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const status = ref('')
const keyword = ref('')
const page = ref(1)
const pageSize = 10
const total = ref(0)
const rows = ref([])
const loading = ref(false)
const loadError = ref('')
const selectedId = ref('')
const editor = ref(null)
const formError = ref('')
const canWrite = computed(() => canWriteVisitor(auth.user))
const canReview = computed(() => canReviewVisitor(auth.user))

const actions = {
  approve: { run: approveVisitor, ok: '已批准来访', ask: '批准这条来访？' },
  reject: { run: rejectVisitor, ok: '已拒绝来访', ask: '拒绝这条来访？' },
  'check-in': { run: checkInVisitor, ok: '已登记入校', ask: '登记入校？' },
  'check-out': { run: checkOutVisitor, ok: '已登记离校', ask: '登记离校？' }
}

function netHint(message) {
  return String(message).split('；').every((part) => part === '网络不可用' || part === '服务暂不可用')
}

function statusText(value) {
  return visitorStatusLabel(value)
}

function statusClass(value) {
  return {
    PENDING: 'pill-warn',
    APPROVED: 'pill-on',
    REJECTED: 'pill-muted',
    CHECKED_IN: 'pill-info',
    CHECKED_OUT: 'pill-ok'
  }[value] || 'pill-muted'
}

function visitSpan(item) {
  const arrival = formatDateTime(item.arrivalTime)
  const leave = formatDateTime(item.leaveTime)
  if (arrival === '—' && leave === '—') return '—'
  return `${arrival} / ${leave}`
}

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const pageList = computed(() => Array.from({ length: pageCount.value }, (_, index) => index + 1).filter((n) => {
  return n === 1 || n === pageCount.value || Math.abs(n - page.value) <= 1
}))
const rangeText = computed(() => {
  if (!total.value) return '0-0'
  const from = (page.value - 1) * pageSize + 1
  const to = Math.min(page.value * pageSize, total.value)
  return `${from}-${to}`
})
const preview = computed(() => {
  if (editor.value) return editor.value
  return rows.value.find((item) => item.id === selectedId.value) || rows.value[0] || null
})

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await fetchVisitorPage({
      page: page.value,
      pageSize,
      status: status.value || undefined,
      keyword: keyword.value.trim() || undefined
    })
    rows.value = result.records
    total.value = result.total
    if (!rows.value.some((item) => item.id === selectedId.value)) selectedId.value = rows.value[0]?.id || ''
  } catch (error) {
    rows.value = []
    total.value = 0
    loadError.value = error.message || '来访登记加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(page, load)
watch([status, keyword], () => {
  if (page.value !== 1) page.value = 1
  else load()
})

function openCreate() {
  formError.value = ''
  editor.value = {
    id: '',
    visitorName: '',
    idNo: '',
    phone: '',
    reason: '',
    hostName: '',
    appointmentTime: '',
    status: 'PENDING'
  }
}

function openEdit(item) {
  formError.value = ''
  editor.value = {
    ...item,
    appointmentTime: toInputDateTime(item.appointmentTime)
  }
}

async function save() {
  formError.value = ''
  const payload = toVisitorPayload(editor.value)
  try {
    if (editor.value.id) await updateVisitor(editor.value.id, payload)
    else await createVisitor(payload)
    ui.toast('来访登记已保存', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  }
}

async function runAction(item, name) {
  const action = actions[name]
  if (!window.confirm(action.ask)) return
  try {
    await action.run(item.id)
    ui.toast(action.ok, 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '操作失败', 'error')
  }
}

async function removeVisitor(item) {
  if (!window.confirm(`删除「${item.visitorName}」的来访登记？`)) return
  try {
    await deleteVisitor(item.id)
    ui.toast('来访登记已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '删除失败', 'error')
  }
}
</script>
