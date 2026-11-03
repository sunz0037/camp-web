<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>用户账号</h1>
        <p>仅管理员可维护。家长与学生使用同一套学生界面。</p>
      </div>
      <button class="btn btn-primary" type="button" @click="open = true">新增账号</button>
    </header>
    <section class="card filters">
      <input v-model="keyword" class="field" placeholder="搜索姓名 / 账号" />
    </section>
    <section class="card table-card">
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
            <tr v-for="item in filtered" :key="item.id">
              <td class="num">{{ item.account }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.actor === 'PARENT' ? '家长' : item.title }}</td>
              <td><span class="pill" :class="item.status === '启用' ? 'pill-ok' : 'pill-muted'">{{ item.status }}</span></td>
              <td>
                <button
                  v-if="item.id !== auth.user?.id"
                  class="linkish"
                  type="button"
                  @click="toggle(item)"
                >
                  {{ item.status === '启用' ? '停用' : '启用' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="open" class="modal-mask" @click.self="open = false">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>新增账号</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="open = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">账号</label>
          <input v-model="draft.account" class="field" required />
          <label class="field-label">姓名</label>
          <input v-model="draft.name" class="field" required />
          <label class="field-label">身份</label>
          <select v-model="draft.role" class="select">
            <option value="ADMIN">管理员</option>
            <option value="ACADEMIC">教务</option>
            <option value="TEACHER">教师</option>
            <option value="STUDENT">学生</option>
            <option value="PARENT">家长</option>
          </select>
          <label class="field-label">初始密码</label>
          <input v-model="draft.password" class="field" placeholder="默认 123456" />
          <p class="field-help">初始密码默认 123456，之后可在个人中心修改。</p>
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'

const auth = useAuthStore()
const ui = useUiStore()
const keyword = ref('')
const open = ref(false)
const formError = ref('')
const draft = reactive({ account: '', name: '', role: 'TEACHER', password: '123456' })

const filtered = computed(() => {
  const query = keyword.value.trim()
  return auth.accounts.filter((item) => !query || `${item.name}${item.account}`.includes(query))
})

function toggle(item) {
  auth.setAccountStatus(item.id, item.status === '启用' ? '停用' : '启用')
  ui.toast('账号状态已更新', 'success')
}

function save() {
  formError.value = ''
  try {
    auth.registerAccount(draft)
    ui.toast('账号已创建', 'success')
    open.value = false
    draft.account = ''
    draft.name = ''
  } catch (error) {
    formError.value = error.message
  }
}
</script>
