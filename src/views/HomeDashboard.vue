<template>
  <div class="page">
    <header class="dash-head">
      <div>
        <h1>{{ greeting() }}，{{ auth.user?.name }}</h1>
        <p class="sub">{{ subtitle }}</p>
      </div>
      <button class="jump" type="button" @click="ui.openPalette()">
        <AppIcon name="Search" :size="16" />
        <span>⌘K 菜单快捷跳转</span>
        <em class="num">{{ unread.length }}</em>
      </button>
    </header>

    <section class="bento">
      <article v-for="card in stats" :key="card.label" class="card stat">
        <p class="label">{{ card.label }}</p>
        <p class="figure num" :class="{ warn: card.warn }">{{ card.value }}</p>
        <p class="hint">{{ card.hint }}</p>
      </article>

      <article v-if="auth.user?.role === 'TEACHER'" class="card block span-2">
        <h2>今日待办</h2>
        <label v-for="todo in campus.todos" :key="todo.id" class="todo" :class="{ done: todo.done }">
          <input type="checkbox" :checked="todo.done" @change="campus.toggleTodo(todo.id)" />
          <button type="button" @click="router.push(todo.to)">{{ todo.text }}</button>
        </label>
      </article>

      <article class="card block" :class="{ 'span-2': auth.user?.role !== 'TEACHER' }">
        <h2>今日课表</h2>
        <p v-if="!today.length" class="sub">今天没有安排。</p>
        <div v-for="item in today" :key="item.id" class="lesson">
          <div>
            <strong class="num">{{ PERIOD_TIME[item.periodStart] }}</strong>
            <div>{{ item.name }}</div>
          </div>
          <small>{{ item.className }} · {{ item.roomNo }} · {{ periodLabel(item.periodStart, item.periodEnd) }} 节</small>
        </div>
      </article>

      <article class="card block span-2">
        <h2>最新校园公告</h2>
        <div v-for="item in latest" :key="item.id" class="news">
          <div>
            <strong>{{ item.pinned ? '置顶 · ' : '' }}{{ item.title }}</strong>
            <small class="muted">{{ item.publishedAt }} · {{ item.scope }}</small>
          </div>
          <span class="pill" :class="item.readBy.includes(auth.user?.id) ? 'pill-muted' : 'pill-info'">
            {{ item.readBy.includes(auth.user?.id) ? '已读' : '未读' }}
          </span>
        </div>
      </article>

      <article class="card block">
        <h2>快捷入口</h2>
        <div class="quick">
          <router-link v-if="auth.can('attendance:record')" class="btn btn-primary" to="/home/attendance">登记考勤</router-link>
          <router-link v-if="auth.can('announcement:publish')" class="btn btn-ghost" to="/home/announcements?publish=1">发布公告</router-link>
          <router-link v-if="auth.user?.role !== 'STUDENT'" class="btn btn-ghost" to="/home/students">学生名册</router-link>
          <router-link v-if="auth.user?.role === 'STUDENT'" class="btn btn-primary" to="/home/my-schedule">我的课表</router-link>
          <router-link v-if="auth.user?.role === 'STUDENT'" class="btn btn-ghost" to="/home/announcements">校园公告</router-link>
          <router-link class="btn btn-ghost" to="/home/profile">个人中心</router-link>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'
import { useCampusStore } from '../stores/campus.js'
import { useUiStore } from '../stores/ui.js'
import { PERIOD_TIME, greeting, periodLabel } from '../utils/format.js'

const auth = useAuthStore()
const campus = useCampusStore()
const ui = useUiStore()
const router = useRouter()

const unread = computed(() => campus.unreadAnnouncements(auth.user?.id))
const today = computed(() => campus.todaySchedules(auth.user))
const latest = computed(() => {
  return [...campus.announcements]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3)
})

const pinnedUnread = computed(() => unread.value.filter((item) => item.pinned).length)
const classCount = computed(() => campus.classesFor(auth.user).length)
const pending = computed(() => campus.pendingClassNames(auth.user).length)

const subtitle = computed(() => {
  const role = auth.user?.role
  if (role === 'TEACHER') return `教学工作台 · 所辖班级与待办概览 · 数据范围 ${classCount.value} 个班级`
  if (role === 'ACADEMIC') return '教务工作台 · 全校学籍、课程与考勤'
  if (role === 'ADMIN') return '管理工作台 · 全校组织与账号'
  if (auth.user?.actor === 'PARENT') return `家长入口 · 与 ${auth.user.linkedStudentName || '学生'} 同一工作台`
  return '学习工作台 · 今日课表与公告'
})

const stats = computed(() => {
  const role = auth.user?.role
  if (role === 'STUDENT') {
    const self = campus.studentsFor(auth.user)[0]
    const ownMarks = campus.sessions.flatMap((session) => session.marks.filter((mark) => mark.studentId === self?.id && mark.status !== 'present'))
    return [
      { label: '今日课程', value: today.value.length, hint: '按开始节次与结束节次' },
      { label: '未读公告', value: unread.value.length, hint: pinnedUnread.value ? `含 ${pinnedUnread.value} 条置顶` : '没有置顶未读' },
      { label: '异常考勤', value: ownMarks.length, hint: '请假、迟到、旷课', warn: ownMarks.length > 0 }
    ]
  }
  return [
    {
      label: role === 'TEACHER' ? '所辖班级人数' : '在籍学生',
      value: campus.headcount(auth.user),
      hint: `${classCount.value} 个班级`
    },
    {
      label: '待登记考勤',
      value: pending.value,
      hint: '今日尚未提交日报的班级',
      warn: pending.value > 0
    },
    {
      label: '未读公告',
      value: unread.value.length,
      hint: pinnedUnread.value ? `含 ${pinnedUnread.value} 条置顶` : '没有置顶未读'
    }
  ]
})
</script>
