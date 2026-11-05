<template>
  <div class="page stack">
    <div class="seg">
      <button type="button" :class="{ active: tab === 'grades' }" @click="setTab('grades')">年级</button>
      <button type="button" :class="{ active: tab === 'classes' }" @click="setTab('classes')">班级</button>
    </div>

    <section v-if="tab === 'grades'" class="card filters">
      <p v-if="loadError" :class="isLoadHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="canWrite" class="btn btn-primary" type="button" @click="openGrade()">新增年级</button>
    </section>
    <section v-else class="card filters">
      <select :value="gradeId" class="select" @change="setGrade">
        <option value="">全部年级</option>
        <option v-for="item in grades" :key="item.id" :value="String(item.id)">{{ item.gradeName }}</option>
      </select>
      <p v-if="loadError" :class="isLoadHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="canWrite" class="btn btn-primary" type="button" @click="openClass()">新增班级</button>
    </section>

    <section v-if="tab === 'grades'" class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>代码</th>
              <th>名称</th>
              <th>类型</th>
              <th>级别</th>
              <th>班级数</th>
              <th v-if="canWrite">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in grades" :key="item.id">
              <td class="num">{{ item.gradeCode }}</td>
              <td>{{ item.gradeName }}</td>
              <td>{{ typeLabel(item.gradeType) }}</td>
              <td class="num">{{ item.gradeLevel }}</td>
              <td class="num">{{ classCount(item.id) }}</td>
              <td v-if="canWrite">
                <button class="linkish" type="button" @click="setGradeId(item.id)">班级</button>
                <button class="linkish" type="button" @click="openGrade(item)">编辑</button>
                <button class="link-danger" type="button" @click="removeGrade(item)">删除</button>
              </td>
            </tr>
            <tr v-if="!grades.length">
              <td :colspan="canWrite ? 6 : 5" class="muted">还没有年级</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>班级</th>
              <th>代码</th>
              <th>班主任</th>
              <th>在籍人数</th>
              <th v-if="canWrite">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleClasses" :key="item.id">
              <td>{{ item.className }}</td>
              <td class="num">{{ item.classCode }}</td>
              <td>{{ item.headTeacherName || '—' }}</td>
              <td class="num">{{ item.currentCount }}</td>
              <td v-if="canWrite">
                <button class="linkish" type="button" @click="openClass(item)">编辑</button>
                <button class="link-danger" type="button" @click="removeClass(item)">删除</button>
              </td>
            </tr>
            <tr v-if="!visibleClasses.length">
              <td :colspan="canWrite ? 5 : 4" class="muted">这个范围还没有班级</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="gradeEditor" class="modal-mask" @click.self="gradeEditor = null">
      <form class="modal-card" @submit.prevent="saveGrade">
        <div class="modal-head">
          <h3>{{ gradeEditor.id ? '编辑年级' : '新增年级' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="gradeEditor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">年级代码</label>
          <input v-model="gradeEditor.gradeCode" class="field" required />
          <label class="field-label">年级名称</label>
          <input v-model="gradeEditor.gradeName" class="field" required />
          <div class="form-row">
            <div>
              <label class="field-label">类型</label>
              <select v-model="gradeEditor.gradeType" class="select">
                <option value="PRIMARY">小学</option>
                <option value="JUNIOR">初中</option>
                <option value="SENIOR">高中</option>
              </select>
            </div>
            <div>
              <label class="field-label">级别</label>
              <input v-model.number="gradeEditor.gradeLevel" class="field num" type="number" min="1" max="6" required />
            </div>
          </div>
          <p v-if="formError" :class="isLoadHint(formError) ? 'load-hint' : 'error-text'">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="gradeEditor = null">取消</button>
            <button class="btn btn-primary" type="submit" :disabled="saving">保存</button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="classEditor" class="modal-mask" @click.self="classEditor = null">
      <form class="modal-card" @submit.prevent="saveClass">
        <div class="modal-head">
          <h3>{{ classEditor.id ? '编辑班级' : '新增班级' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="classEditor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">年级</label>
          <select v-model="classEditor.gradeId" class="select">
            <option v-for="item in grades" :key="item.id" :value="String(item.id)">{{ item.gradeName }}</option>
          </select>
          <div class="form-row">
            <div>
              <label class="field-label">班级代码</label>
              <input v-model="classEditor.classCode" class="field" required />
            </div>
            <div>
              <label class="field-label">序号</label>
              <input v-model.number="classEditor.classNumber" class="field num" type="number" min="1" required />
            </div>
          </div>
          <label class="field-label">班级名称</label>
          <input v-model="classEditor.className" class="field" placeholder="例如 高一(4)班" required />
          <div class="form-row">
            <div>
              <label class="field-label">班主任</label>
              <select v-model="classEditor.headTeacherId" class="select">
                <option value="">不指定</option>
                <option v-for="item in teachers" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">容量</label>
              <input v-model.number="classEditor.capacity" class="field num" type="number" min="1" />
            </div>
          </div>
          <p v-if="formError" :class="isLoadHint(formError) ? 'load-hint' : 'error-text'">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="classEditor = null">取消</button>
            <button class="btn btn-primary" type="submit" :disabled="saving">保存</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { createClass, createGrade, deleteClass, deleteGrade, fetchGrades, fetchOrgClasses, updateClass, updateGrade } from '../api/org.js'
import { fetchStaffOptions } from '../api/users.js'
import { classWritePayload, gradeWritePayload, validateGrade, validateSchoolClass } from '../domain/writePayloads.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { isLoadHint } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()
const grades = ref([])
const classes = ref([])
const teachers = ref([])
const loadError = ref('')
const formError = ref('')
const saving = ref(false)
const gradeEditor = ref(null)
const classEditor = ref(null)

const canWrite = computed(() => auth.can('org:write'))
const tab = computed(() => (route.query.tab === 'grades' ? 'grades' : 'classes'))
const gradeId = computed(() => (route.query.gradeId ? String(route.query.gradeId) : ''))
const visibleClasses = computed(() => {
  if (!gradeId.value) return classes.value
  return classes.value.filter((item) => String(item.gradeId) === gradeId.value)
})

function typeLabel(value) {
  return { PRIMARY: '小学', JUNIOR: '初中', SENIOR: '高中' }[value] || value || '—'
}

function classCount(id) {
  return classes.value.filter((item) => String(item.gradeId) === String(id)).length
}

function setTab(value) {
  const query = { tab: value }
  if (value === 'classes' && gradeId.value) query.gradeId = gradeId.value
  router.replace({ path: route.path, query })
}

function setGrade(event) {
  setGradeId(event.target.value)
}

function setGradeId(id) {
  const query = { tab: 'classes' }
  if (id) query.gradeId = String(id)
  router.replace({ path: route.path, query })
}

async function load() {
  loadError.value = ''
  const errors = []
  try {
    grades.value = await fetchGrades()
  } catch (error) {
    grades.value = []
    errors.push(error.message || '年级加载失败')
  }
  try {
    classes.value = await fetchOrgClasses()
  } catch (error) {
    classes.value = []
    errors.push(error.message || '班级加载失败')
  }
  try {
    teachers.value = await fetchStaffOptions(2)
  } catch {
    teachers.value = []
  }
  loadError.value = errors.join('；')
}

onMounted(load)
watch(() => route.query.tab, () => {
  gradeEditor.value = null
  classEditor.value = null
  formError.value = ''
})

function openGrade(item) {
  formError.value = ''
  gradeEditor.value = item
    ? { ...item }
    : { id: '', gradeCode: '', gradeName: '', gradeType: 'SENIOR', gradeLevel: 1, status: 1 }
}

function openClass(item) {
  formError.value = ''
  classEditor.value = item
    ? { ...item, gradeId: item.gradeId ? String(item.gradeId) : '', headTeacherId: item.headTeacherId ? String(item.headTeacherId) : '', capacity: item.capacity || '' }
    : {
        id: '',
        gradeId: gradeId.value || (grades.value[0]?.id ? String(grades.value[0].id) : ''),
        classCode: '',
        className: '',
        classNumber: 1,
        capacity: 45,
        headTeacherId: '',
        status: 1
      }
}

async function saveGrade() {
  formError.value = ''
  const errors = validateGrade(gradeEditor.value)
  if (errors.length) {
    formError.value = errors[0]
    return
  }
  saving.value = true
  try {
    const payload = gradeWritePayload(gradeEditor.value)
    if (gradeEditor.value.id) await updateGrade(gradeEditor.value.id, payload)
    else await createGrade(payload)
    ui.toast('年级已保存', 'success')
    gradeEditor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function saveClass() {
  formError.value = ''
  const errors = validateSchoolClass(classEditor.value)
  if (errors.length) {
    formError.value = errors[0]
    return
  }
  saving.value = true
  try {
    const payload = classWritePayload(classEditor.value)
    if (classEditor.value.id) await updateClass(classEditor.value.id, payload)
    else await createClass(payload)
    ui.toast('班级已保存', 'success')
    classEditor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function removeGrade(item) {
  if (!window.confirm(`删除年级「${item.gradeName}」？名下仍有班级时会被拒绝。`)) return
  try {
    await deleteGrade(item.id)
    ui.toast('年级已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '删除失败', 'error')
  }
}

async function removeClass(item) {
  if (!window.confirm(`删除班级「${item.className}」？名下仍有学生时会被拒绝。`)) return
  try {
    await deleteClass(item.id)
    ui.toast('班级已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '删除失败', 'error')
  }
}
</script>
