<template>
  <div class="page stack">
    <section class="card preview-card">
      <h2>表单预览</h2>
      <form @submit.prevent="saveProfile">
        <div class="preview-grid">
          <div>
            <label class="field-label">姓名</label>
            <input class="field" :value="auth.user?.name || ''" readonly />
          </div>
          <div>
            <label class="field-label">身份</label>
            <input class="field" :value="auth.user?.title || ''" readonly />
          </div>
          <div>
            <label class="field-label">账号</label>
            <input class="field" :value="idLine" readonly />
          </div>
          <div>
            <label class="field-label">手机</label>
            <input v-model="phone" class="field num" inputmode="tel" autocomplete="tel" />
          </div>
          <div>
            <label class="field-label">邮箱</label>
            <input v-model="email" class="field" type="email" autocomplete="email" />
          </div>
          <div>
            <label class="field-label">密码</label>
            <p class="sub"><router-link to="/home/change-password">修改密码</router-link></p>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">保存</button>
        </div>
      </form>
    </section>
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

const idLine = computed(() => auth.user?.employeeNo || auth.user?.studentNo || auth.user?.account || '—')

function saveProfile() {
  auth.updateProfile({ phone: phone.value.trim(), email: email.value.trim() })
  ui.toast('个人档案已保存', 'success')
}
</script>
