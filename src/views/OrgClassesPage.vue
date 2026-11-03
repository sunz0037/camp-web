<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>年级班级</h1>
        <p>组织架构。{{ auth.can('org:write') ? '可维护年级与班级。' : '当前身份只读。' }}</p>
      </div>
      <div v-if="auth.can('org:write')" class="head-actions">
        <button class="btn btn-ghost" type="button" @click="gradeOpen = true">新增年级</button>
        <button class="btn btn-primary" type="button" @click="classOpen = true">新增班级</button>
      </div>
    </header>

    <div class="org-grid">
      <section class="card" style="padding: 8px">
        <button
          v-for="item in campus.grades"
          :key="item"
          type="button"
          class="grade-item"
          :class="{ active: grade === item }"
          @click="grade = item"
        >
          <strong>{{ item }}</strong>
          <span>{{ countOf(item) }} 个班级</span>
        </button>
      </section>
      <section class="card table-card">
        <div class="table-scroll">
          <table class="data">
            <thead>
              <tr>
                <th>班级</th>
                <th>班主任</th>
                <th>教室</th>
                <th>在籍人数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in visible" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.head }}</td>
                <td class="num">{{ item.room }}</td>
                <td class="num">{{ sizeOf(item.name) }}</td>
              </tr>
              <tr v-if="!visible.length">
                <td colspan="4" class="muted">这个年级还没有班级</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div v-if="gradeOpen" class="modal-mask" @click.self="gradeOpen = false">
      <form class="modal-card" @submit.prevent="saveGrade">
        <div class="modal-head">
          <h3>新增年级</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="gradeOpen = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <input v-model="gradeName" class="field" placeholder="例如 高四" />
        <p v-if="formError" class="error-text">{{ formError }}</p>
        <div class="form-actions"><button class="btn btn-primary" type="submit">保存</button></div>
      </form>
    </div>

    <div v-if="classOpen" class="modal-mask" @click.self="classOpen = false">
      <form class="modal-card" @submit.prevent="saveClass">
        <div class="modal-head">
          <h3>新增班级</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="classOpen = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">年级</label>
          <select v-model="draft.grade" class="select">
            <option v-for="item in campus.grades" :key="item">{{ item }}</option>
          </select>
          <label class="field-label">班级名称</label>
          <input v-model="draft.name" class="field" placeholder="例如 高一(4)班" required />
          <div class="form-row">
            <div>
              <label class="field-label">班主任</label>
              <input v-model="draft.head" class="field" />
            </div>
            <div>
              <label class="field-label">教室</label>
              <input v-model="draft.room" class="field" />
            </div>
          </div>
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions"><button class="btn btn-primary" type="submit">保存</button></div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'
import { useCampusStore } from '../stores/campus.js'
import { useUiStore } from '../stores/ui.js'

const auth = useAuthStore()
const campus = useCampusStore()
const ui = useUiStore()
const grade = ref('高一')
const gradeOpen = ref(false)
const classOpen = ref(false)
const gradeName = ref('')
const formError = ref('')
const draft = reactive({ grade: '高一', name: '', head: '', room: '' })

const visibleSource = computed(() => {
  if (auth.user?.role === 'TEACHER') return campus.classesFor(auth.user)
  return campus.classes
})
const visible = computed(() => visibleSource.value.filter((item) => item.grade === grade.value))

function countOf(name) {
  return visibleSource.value.filter((item) => item.grade === name).length
}

function sizeOf(className) {
  return campus.students.filter((item) => item.className === className).length
}

function saveGrade() {
  formError.value = ''
  try {
    campus.addGrade(gradeName.value)
    grade.value = gradeName.value.trim()
    gradeName.value = ''
    gradeOpen.value = false
    ui.toast('年级已添加', 'success')
  } catch (error) {
    formError.value = error.message
  }
}

function saveClass() {
  formError.value = ''
  try {
    campus.addClass(draft)
    grade.value = draft.grade
    draft.name = ''
    draft.head = ''
    draft.room = ''
    classOpen.value = false
    ui.toast('班级已添加', 'success')
  } catch (error) {
    formError.value = error.message
  }
}
</script>
