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

      <section class="card block">
        <h2>外观</h2>
        <p class="sub">默认外观与当前版本一致。切换后保存到你的账号。</p>
        <div class="seg" style="margin-top: 14px" role="group" aria-label="外观">
          <button type="button" :class="{ active: theme.themeKey === 'default' }" :aria-pressed="theme.themeKey === 'default'" @click="pickTheme('default')">默认</button>
          <button type="button" :class="{ active: theme.themeKey === 'dark' }" :aria-pressed="theme.themeKey === 'dark'" @click="pickTheme('dark')">暗色</button>
          <button type="button" :class="{ active: theme.themeKey === 'campus-green' }" :aria-pressed="theme.themeKey === 'campus-green'" @click="pickTheme('campus-green')">校园绿</button>
        </div>
      </section>

      <form class="card block" @submit.prevent="savePassword">
        <h2>修改密码</h2>
        <p class="sub">也可以到 <router-link to="/home/change-password">修改密码</router-link>。成功后需要重新登录。</p>
        <div class="form-grid" style="margin-top: 14px">
          <label class="field-label">当前密码</label>
          <input v-model="currentPassword" class="field" type="password" autocomplete="current-password" />
          <label class="field-label">新密码</label>
          <input v-model="nextPassword" class="field" type="password" autocomplete="new-password" />
          <label class="field-label">确认新密码</label>
          <input v-model="confirmPassword" class="field" type="password" autocomplete="new-password" />
          <p v-if="error" class="error-text">{{ error }}</p>
          <div>
            <button class="btn btn-primary" type="submit" :disabled="passwordLoading">{{ passwordLoading ? '提交中…' : '更新密码' }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useThemeStore } from '../stores/theme.js'
import { useUiStore } from '../stores/ui.js'
import { resetRouteInstall } from '../router/index.js'

const auth = useAuthStore()
const theme = useThemeStore()
const ui = useUiStore()
const router = useRouter()
const phone = ref(auth.user?.phone || '')
const email = ref(auth.user?.email || '')
const currentPassword = ref('')
const nextPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const passwordLoading = ref(false)

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

async function pickTheme(key) {
  try {
    await theme.setTheme(key)
    ui.toast(key === 'default' ? '已恢复默认外观' : '外观已保存', 'success')
  } catch (err) {
    ui.toast(err.message || '外观保存失败', 'error')
  }
}

async function savePassword() {
  error.value = ''
  if (nextPassword.value.length < 6) {
    error.value = '新密码至少 6 位'
    return
  }
  if (nextPassword.value !== confirmPassword.value) {
    error.value = '两次输入的新密码不一致'
    return
  }
  if (currentPassword.value === nextPassword.value) {
    error.value = '新密码不能与当前密码相同'
    return
  }
  passwordLoading.value = true
  try {
    await auth.changePassword({ oldPassword: currentPassword.value, nextPassword: nextPassword.value })
    ui.toast('密码已更新，请重新登录', 'success')
    setTimeout(() => {
      auth.logout()
      resetRouteInstall()
      router.replace('/login')
    }, 700)
  } catch (err) {
    error.value = err.message || '修改密码失败'
  } finally {
    passwordLoading.value = false
  }
}
</script>
