<template>
  <div class="login-page">
    <header class="login-top">
      <div class="login-logo">
        <span class="brand-mark"><AppIcon name="GraduationCap" :size="16" /></span>
        校园OA
      </div>
      <span class="quiet">综合协同与教务管理</span>
    </header>

    <main class="login-grid">
      <section class="brand-panel">
        <div class="quiet-pill"><i></i>平静 · 有序 · 千人千面</div>
        <h1>欢迎回来，<br />校园事务一站办妥</h1>
        <p class="lead">学生与教职工统一入口。首期覆盖学生、课程、考勤与公告，角色工作台按权限动态呈现。</p>
        <div class="features">
          <article v-for="item in features" :key="item.title" class="feature">
            <i></i>
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.desc }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="login-card">
        <h2>登录校园OA</h2>
        <p class="intro">家长与学生同入口同权限；找回密码请联系教务或管理员重置。</p>
        <div class="tabs" role="tablist">
          <button type="button" :class="{ active: portal === 'student' }" @click="portal = 'student'">学生登录</button>
          <button type="button" :class="{ active: portal === 'staff' }" @click="portal = 'staff'">教职工登录</button>
        </div>
        <form @submit.prevent="submit">
          <label class="field-label" for="account">学号 / 工号</label>
          <input id="account" v-model="account" class="field" autocomplete="username" placeholder="请输入学号或工号" />
          <div style="height: 14px"></div>
          <label class="field-label" for="password">密码</label>
          <input id="password" v-model="password" class="field" type="password" autocomplete="current-password" placeholder="请输入密码" />
          <div class="login-meta">
            <span>演示密码 Demo@123456</span>
            <button type="button" @click="forgot = true">忘记密码？</button>
          </div>
          <p v-if="error" class="error-text">{{ error }}</p>
          <button class="btn btn-primary btn-block btn-lg" type="submit" :disabled="loading">
            {{ loading ? '正在进入…' : '进入工作台' }}
          </button>
          <p class="fineprint">短信通道未接入首期；访客预约与人脸识别已移除。</p>
        </form>
      </section>
    </main>

    <footer class="login-foot">
      <span>校园OA · 首期视觉稿</span>
      <span>Bento · 蓝绿平静色板 · 微交互五分级</span>
    </footer>

    <div v-if="forgot" class="modal-mask" @click.self="forgot = false">
      <div class="modal-card" role="dialog" aria-labelledby="forgot-title">
        <div class="modal-head">
          <h3 id="forgot-title">忘记密码</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="forgot = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <p class="sub" style="margin-top: 0">找回密码请联系教务或管理员重置。首期没有短信通道，也不能在线自助找回。</p>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" @click="forgot = false">知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'
import { landingPath } from '../nav.js'

const router = useRouter()
const auth = useAuthStore()
const portal = ref('student')
const account = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const forgot = ref(false)
// PHASE2-BLOCKED: 短信通道与在线自助找回后置。弹层只说明联系教务，不发送验证码。

const features = [
  { title: '学生与学籍', desc: '花名册、导入导出、应急联系人' },
  { title: '课程与课表', desc: '课程库、班级授课、我的课表' },
  { title: '考勤日报', desc: '班级汇总 + 异常明细' },
  { title: '校园公告', desc: '发布、置顶、已读回执' }
]

async function submit() {
  error.value = ''
  if (!account.value.trim() || !password.value) {
    error.value = '请输入学号或工号，以及密码'
    return
  }
  loading.value = true
  try {
    await auth.login({ account: account.value, password: password.value, portal: portal.value })
    router.replace(landingPath())
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
