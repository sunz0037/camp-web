<template>
  <div class="page">
    <form class="card block password-card" @submit.prevent="submit">
      <h2>修改密码</h2>
      <p class="sub">修改成功后需要重新登录。新密码至少 6 位。</p>
      <div class="form-grid" style="margin-top: 14px">
        <label class="field-label">当前密码</label>
        <input v-model="oldPassword" class="field" type="password" autocomplete="current-password" required />
        <label class="field-label">新密码</label>
        <input v-model="nextPassword" class="field" type="password" autocomplete="new-password" minlength="6" required />
        <label class="field-label">确认新密码</label>
        <input v-model="confirmPassword" class="field" type="password" autocomplete="new-password" minlength="6" required />
        <p v-if="error" class="error-text">{{ error }}</p>
        <div class="form-actions">
          <router-link class="btn btn-ghost" to="/home/profile">取消</router-link>
          <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? '提交中…' : '确认修改' }}</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { resetRouteInstall } from '../router/index.js'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const oldPassword = ref('')
const nextPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  if (nextPassword.value.length < 6) {
    error.value = '新密码至少 6 位'
    return
  }
  if (nextPassword.value !== confirmPassword.value) {
    error.value = '两次输入的新密码不一致'
    return
  }
  if (oldPassword.value === nextPassword.value) {
    error.value = '新密码不能与当前密码相同'
    return
  }
  loading.value = true
  try {
    await auth.changePassword({ oldPassword: oldPassword.value, nextPassword: nextPassword.value })
    ui.toast('密码已更新，请重新登录', 'success')
    setTimeout(() => {
      auth.logout()
      resetRouteInstall()
      router.replace('/login')
    }, 700)
  } catch (err) {
    error.value = err.message || '修改密码失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-card {
  max-width: 560px;
}
</style>
