<template>
  <div class="page stack">
    <section class="card filters">
      <input v-model="keyword" class="field" placeholder="搜索姓名 / 账号" />
      <p v-if="loadError" :class="isLoadHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('user:write')" class="btn btn-primary" type="button" @click="openCreate">+ 新增</button>
    </section>
    <section class="card table-card">
      <div class="status-legend">
        <span>状态</span>
        <span class="pill pill-on">启用</span>
        <span class="pill pill-ok">禁用</span>
      </div>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>账号</th>
              <th>姓名</th>
              <th>身份</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id" class="row-pick" :class="{ picked: selectedId === item.id }" @click="selectedId = item.id">
              <td class="num">{{ item.account }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.title }}</td>
              <td><span class="pill" :class="item.status === '启用' ? 'pill-on' : 'pill-ok'">{{ item.status === '启用' ? '启用' : '禁用' }}</span></td>
              <td>
                <button v-if="auth.can('user:write')" class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
                <button
                  v-if="auth.can('user:write') && String(item.id) !== String(auth.user?.id)"
                  :class="item.status === '启用' ? 'link-danger' : 'linkish'"
                  type="button"
                  @click.stop="toggle(item)"
                >
                  {{ item.status === '启用' ? '停用' : '启用' }}
                </button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="5" class="muted">没有符合条件的账号</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <form v-if="editor && auth.can('user:write')" class="form-grid" @submit.prevent="save">
        <p class="sub" style="margin: 0">{{ editor.id ? '编辑账号' : '新增账号' }}</p>
        <div class="form-row">
          <div>
            <label class="field-label">账号</label>
            <input v-model="editor.account" class="field" required />
          </div>
          <div>
            <label class="field-label">姓名</label>
            <input v-model="editor.name" class="field" required />
          </div>
        </div>
        <label class="field-label">身份</label>
        <select v-model="editor.role" class="select">
          <option value="ADMIN">管理员</option>
          <option value="ACADEMIC">教务</option>
          <option value="TEACHER">教师</option>
          <option value="STUDENT">学生</option>
        </select>
        <div class="form-row">
          <div>
            <label class="field-label">手机</label>
            <input v-model="editor.phone" class="field num" inputmode="numeric" />
          </div>
          <div>
            <label class="field-label">邮箱</label>
            <input v-model="editor.email" class="field" />
          </div>
        </div>
        <template v-if="!editor.id">
          <label class="field-label">初始密码</label>
          <input v-model="editor.password" class="field" placeholder="默认 Demo@123456" />
          <p class="field-help">初始密码只在新增时提交。留空时由服务端生成默认口令。</p>
        </template>
        <p v-if="formError" :class="isLoadHint(formError) ? 'load-hint' : 'error-text'">{{ formError }}</p>
        <div class="form-actions">
          <button class="btn btn-ghost" type="button" @click="editor = null">取消</button>
          <button class="btn btn-primary" type="submit" :disabled="saving">保存</button>
        </div>
      </form>
      <div v-else-if="formPreview" class="preview-grid">
        <div><span class="k">账号</span><span class="v">{{ formPreview.account || '—' }}</span></div>
        <div><span class="k">姓名</span><span class="v">{{ formPreview.name || '—' }}</span></div>
        <div><span class="k">身份</span><span class="v">{{ formPreview.title || '—' }}</span></div>
        <div><span class="k">状态</span><span class="v">{{ formPreview.status === '启用' ? '启用' : '禁用' }}</span></div>
      </div>
      <p v-else class="sub">选择一行或点击新增，这里显示账号、姓名、身份和状态。</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { createUser, fetchUserPage, replaceUserRoles, updateUser, updateUserStatus } from '../api/users.js'
import { roleCodesPayload, userCreatePayload, userUpdatePayload, validateUser } from '../domain/writePayloads.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { isLoadHint } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const keyword = ref('')
const rows = ref([])
const loadError = ref('')
const selectedId = ref('')
const editor = ref(null)
const formError = ref('')
const saving = ref(false)

const filtered = computed(() => rows.value)

const formPreview = computed(() => {
  return filtered.value.find((row) => row.id === selectedId.value) || filtered.value[0] || null
})

async function load() {
  loadError.value = ''
  try {
    const result = await fetchUserPage({ keyword: keyword.value.trim() || undefined })
    rows.value = result.records
  } catch (error) {
    rows.value = []
    loadError.value = error.message || '用户列表加载失败'
  }
}

onMounted(load)

let keywordTimer = 0
watch(keyword, () => {
  window.clearTimeout(keywordTimer)
  keywordTimer = window.setTimeout(load, 250)
})

function openCreate() {
  formError.value = ''
  editor.value = { id: '', account: '', name: '', role: 'TEACHER', phone: '', email: '', password: 'Demo@123456' }
}

function openEdit(item) {
  formError.value = ''
  selectedId.value = item.id
  editor.value = {
    id: item.id,
    account: item.account,
    name: item.name,
    role: item.role || 'TEACHER',
    phone: item.phone,
    email: item.email,
    userType: item.userType
  }
}

async function save() {
  formError.value = ''
  const creating = !editor.value.id
  const errors = validateUser(editor.value, { creating })
  if (errors.length) {
    formError.value = errors[0]
    return
  }
  saving.value = true
  try {
    if (creating) {
      const payload = userCreatePayload(editor.value)
      await createUser(payload)
      await load()
      const created = rows.value.find((item) => item.account === payload.username)
      if (!created) {
        formError.value = '账号已创建，但列表里还找不到它，身份尚未写入'
        return
      }
      editor.value = { ...editor.value, id: created.id }
      try {
        await replaceUserRoles(created.id, roleCodesPayload(editor.value.role))
      } catch (error) {
        formError.value = `账号已创建，身份未写入：${error.message || '请求失败'}`
        return
      }
    } else {
      await updateUser(editor.value.id, userUpdatePayload(editor.value))
      // PHASE2-BLOCKED: 请求体已是 { roleCodes }。冒烟 PUT /users/{id}/roles 返回 409「数据冲突或仍被引用，无法保存」，是后端数据完整性异常，交给 camp-app。
      await replaceUserRoles(editor.value.id, roleCodesPayload(editor.value.role))
    }
    ui.toast(creating ? '账号已创建' : '账号已保存', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function toggle(item) {
  const next = item.status === '启用' ? 0 : 1
  try {
    await updateUserStatus(item.id, next)
    ui.toast('账号状态已更新', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '更新状态失败', 'error')
  }
}
</script>
