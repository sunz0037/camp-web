<template>
  <div class="page stack">
    <section class="card filters filters-wrap">
      <select v-model="studentId" class="select" aria-label="学生">
        <option value="">全部学生</option>
        <option v-for="item in students" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索联系人 / 电话" />
      <button class="btn btn-primary" type="button" @click="openCreate">+ 新增应急联系人</button>
    </section>

    <section class="card table-card">
      <div class="status-legend">
        <span>关系</span>
        <span class="pill pill-on">父亲</span>
        <span class="pill pill-info">母亲</span>
        <span class="pill pill-warn">监护人</span>
        <span class="pill pill-muted">其他</span>
      </div>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>联系人姓名</th>
              <th>关系</th>
              <th>电话</th>
              <th>备用电话</th>
              <th>地址</th>
              <th>主要联系人</th>
              <th class="ops">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filtered"
              :key="item.id"
              class="row-pick"
              :class="{ picked: selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.relation }}</td>
              <td class="num">{{ item.phone }}</td>
              <td class="num">{{ item.backup || '—' }}</td>
              <td>{{ item.address || '—' }}</td>
              <td>{{ item.primary ? '是' : '否' }}</td>
              <td class="ops">
                <button class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
                <button class="link-danger" type="button" @click.stop="remove(item)">删除</button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="muted">没有符合条件的应急联系人。当前列表是本地示例，未接后台。</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-foot">
        <span>共 {{ filtered.length }} 条联系人</span>
      </div>
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <form v-if="editor" class="form-grid" @submit.prevent="save">
        <p class="sub" style="margin: 0">{{ editor.id ? '编辑应急联系人' : '新增应急联系人' }}</p>
        <label class="field-label">学生</label>
        <select v-model="editor.studentId" class="select" required>
          <option value="">请选择学生</option>
          <option v-for="item in students" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
        <div class="form-row">
          <div>
            <label class="field-label">联系人姓名</label>
            <input v-model="editor.name" class="field" required />
          </div>
          <div>
            <label class="field-label">关系</label>
            <select v-model="editor.relation" class="select" required>
              <option v-for="item in relations" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div>
            <label class="field-label">电话</label>
            <input v-model="editor.phone" class="field num" required />
          </div>
          <div>
            <label class="field-label">备用电话</label>
            <input v-model="editor.backup" class="field num" />
          </div>
        </div>
        <label class="field-label">地址</label>
        <input v-model="editor.address" class="field" />
        <label class="check"><input v-model="editor.primary" type="checkbox" /> 设为主要联系人</label>
        <p v-if="formError" class="error-text">{{ formError }}</p>
        <div class="form-actions">
          <button class="btn btn-ghost" type="button" @click="editor = null">取消</button>
          <button class="btn btn-primary" type="submit">保存</button>
        </div>
      </form>
      <div v-else-if="preview" class="preview-grid">
        <div><span class="k">学生</span><span class="v">{{ studentName(preview.studentId) }}</span></div>
        <div><span class="k">联系人</span><span class="v">{{ preview.name }}</span></div>
        <div><span class="k">关系</span><span class="v">{{ preview.relation }}</span></div>
        <div><span class="k">电话</span><span class="v num">{{ preview.phone }}</span></div>
        <div><span class="k">备用电话</span><span class="v num">{{ preview.backup || '—' }}</span></div>
        <div><span class="k">地址</span><span class="v">{{ preview.address || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一行或点击新增。数据只留在本页，不请求后台。</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUiStore } from '../stores/ui.js'

const ui = useUiStore()
const relations = ['父亲', '母亲', '监护人', '其他']
const students = [
  { id: 's1', name: '学生王小明' },
  { id: 's2', name: '学生李小雨' }
]
const rows = ref([
  { id: 'c1', studentId: 's1', name: '王芳', relation: '母亲', phone: '13900000001', backup: '', address: '初一1班家长', primary: true },
  { id: 'c2', studentId: 's1', name: '王强', relation: '父亲', phone: '13900000002', backup: '13800000011', address: '', primary: false },
  { id: 'c3', studentId: 's2', name: '李敏', relation: '监护人', phone: '13900000003', backup: '', address: '', primary: true }
])
const studentId = ref('')
const keyword = ref('')
const selectedId = ref('c1')
const editor = ref(null)
const formError = ref('')

const filtered = computed(() => {
  const query = keyword.value.trim()
  return rows.value.filter((item) => {
    if (studentId.value && item.studentId !== studentId.value) return false
    if (!query) return true
    return `${item.name}${item.phone}${item.backup}`.includes(query)
  })
})
const preview = computed(() => filtered.value.find((item) => item.id === selectedId.value) || filtered.value[0] || null)

function studentName(id) {
  return students.find((item) => item.id === id)?.name || '—'
}

function openCreate() {
  formError.value = ''
  editor.value = { id: '', studentId: studentId.value || 's1', name: '', relation: '母亲', phone: '', backup: '', address: '', primary: false }
}

function openEdit(item) {
  formError.value = ''
  selectedId.value = item.id
  editor.value = { ...item }
}

function save() {
  formError.value = ''
  const phone = String(editor.value.phone || '').trim()
  if (!/^1\d{10}$/.test(phone)) {
    formError.value = '电话应为 11 位数字'
    return
  }
  const next = { ...editor.value, name: editor.value.name.trim(), phone, backup: editor.value.backup.trim(), address: editor.value.address.trim() }
  if (next.primary) {
    rows.value.forEach((item) => {
      if (item.studentId === next.studentId) item.primary = false
    })
  }
  if (next.id) {
    const index = rows.value.findIndex((item) => item.id === next.id)
    if (index >= 0) rows.value[index] = next
  } else {
    next.id = `c${Date.now().toString(36)}`
    rows.value.unshift(next)
  }
  selectedId.value = next.id
  editor.value = null
  ui.toast('应急联系人已保存在本页', 'success')
}

function remove(item) {
  rows.value = rows.value.filter((row) => row.id !== item.id)
  ui.toast('已从本页移除', 'success')
}
</script>
