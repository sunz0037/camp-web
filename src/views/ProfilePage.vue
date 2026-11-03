<template>
  <div class="page">
    <div class="profile-wrap">
      <section class="card identity">
        <div class="avatar">{{ avatar }}</div>
        <div>
          <h1 style="font-size: 22px">{{ auth.user?.name }}</h1>
          <p class="sub">{{ auth.user?.title }} · {{ auth.user?.employeeNo || auth.user?.studentNo || auth.user?.account }}</p>
        </div>
      </section>

      <form class="card block" @submit.prevent="saveProfile">
        <h2>个人档案</h2>
        <div class="form-grid" style="margin-top: 14px">
          <label class="field-label">手机</label>
          <input v-model="phone" class="field num" />
          <label class="field-label">邮箱</label>
          <input v-model="email" class="field" type="email" />
          <div>
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>

      <form class="card block" @submit.prevent="savePassword">
        <h2>修改密码</h2>
        <div class="form-grid" style="margin-top: 14px">
          <label class="field-label">当前密码</label>
          <input v-model="currentPassword" class="field" type="password" autocomplete="current-password" />
          <label class="field-label">新密码</label>
          <input v-model="nextPassword" class="field" type="password" autocomplete="new-password" />
          <label class="field-label">确认新密码</label>
          <input v-model="confirmPassword" class="field" type="password" autocomplete="new-password" />
          <p v-if="error" class="error-text">{{ error }}</p>
          <div>
            <button class="btn btn-primary" type="submit">更新密码</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'

const auth = useAuthStore()
const ui = useUiStore()
const phone = ref(auth.user?.phone || '')
const email = ref(auth.user?.email || '')
const currentPassword = ref('')
const nextPassword = ref('')
const confirmPassword = ref('')
const error = ref('')

const avatar = computed(() => {
  const title = auth.user?.title || ''
  if (title === '教师') return '教'
  if (title === '学生') return '学'
  if (title === '家长') return '家'
  if (title === '教务') return '务'
  return '管'
})

function saveProfile() {
  auth.updateProfile({ phone: phone.value.trim(), email: email.value.trim() })
  ui.toast('个人档案已保存', 'success')
}

function savePassword() {
  error.value = ''
  if (nextPassword.value.length < 6) {
    error.value = '新密码至少 6 位'
    return
  }
  if (nextPassword.value !== confirmPassword.value) {
    error.value = '两次输入的新密码不一致'
    return
  }
  try {
    auth.changePassword({ oldPassword: currentPassword.value, nextPassword: nextPassword.value })
    currentPassword.value = ''
    nextPassword.value = ''
    confirmPassword.value = ''
    ui.toast('密码已更新', 'success')
  } catch (err) {
    error.value = err.message
  }
}
</script>
