<template>
  <div class="page stack">
    <section class="card filters">
      <select v-model="classId" class="select">
        <option value="">全部班级</option>
        <option v-for="item in classes" :key="item.id" :value="String(item.id)">
          {{ item.name }}{{ item.placeholder ? '（占位）' : '' }}
        </option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索科目代码 / 名称 / 教师" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('course:write')" class="btn btn-primary" type="button" @click="openCreate">+ 添加授课科目</button>
    </section>

    <div class="status-legend">
      <span>状态</span>
      <span class="pill pill-on">已启用</span>
      <span class="pill pill-ok">未启用</span>
    </div>

    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>科目代码</th>
              <th>科目名称</th>
              <th>科目类型</th>
              <th>授课教师</th>
              <th>学年</th>
              <th>学期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="muted">加载中…</td>
            </tr>
            <tr v-else-if="usingPlaceholder">
              <td colspan="8" class="muted">{{ PLACEHOLDER_ROW }}</td>
            </tr>
            <tr v-else-if="!filtered.length">
              <td colspan="8" class="muted">暂无数据</td>
            </tr>
            <template v-else>
            <tr
              v-for="item in filtered"
              :key="item.id"
              class="row-pick"
              :class="{ picked: selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <td class="num">{{ item.courseCode || '—' }}</td>
              <td>{{ item.courseName || '—' }}</td>
              <td>{{ item.courseType || '—' }}</td>
              <td>{{ item.teacherName || '—' }}</td>
              <td>{{ item.academicYear || '—' }}</td>
              <td>{{ item.semester || '—' }}</td>
              <td><span class="pill" :class="item.status === '已启用' ? 'pill-on' : 'pill-ok'">{{ item.status }}</span></td>
              <td>
                <button v-if="auth.can('course:write')" class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
                <button v-if="auth.can('course:write')" class="link-danger" type="button" @click.stop="remove(item)">删除</button>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
      <TablePager :summary="summary" :page="page" :page-count="pageCount" :page-list="pageList" @update:page="page = $event" />
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <div v-if="preview" class="preview-grid">
        <div><span class="k">科目</span><span class="v">{{ preview.courseLabel || '—' }}</span></div>
        <div><span class="k">学年</span><span class="v num">{{ preview.academicYear || '—' }}</span></div>
        <div><span class="k">学期</span><span class="v">{{ preview.semester || '—' }}</span></div>
        <div><span class="k">状态</span><span class="v">{{ preview.status || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一行或点击添加，这里显示科目、学年和学期。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>{{ editor.id ? '编辑授课科目' : '添加授课科目' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <template v-if="editor.id">
            <label class="field-label">科目代码</label>
            <input class="field num" :value="editor.courseCode" readonly />
            <label class="field-label">科目名称</label>
            <input class="field" :value="editor.courseName" readonly />
          </template>
          <template v-else>
            <label class="field-label">选择科目</label>
            <div v-if="courses.length" class="course-picks">
              <label v-for="course in courses" :key="course.id" class="check">
                <input v-model="editor.courseIds" type="checkbox" :value="course.id" />
                <span>{{ course.code }} - {{ course.name }}{{ course.placeholder ? '（占位）' : '' }}</span>
              </label>
            </div>
            <p v-else class="sub">暂无可用科目，请先在科目管理中创建科目。</p>
          </template>
          <label class="field-label">学年</label>
          <input v-model="editor.academicYear" class="field num" placeholder="如：2024-2025" />
          <label class="field-label">学期</label>
          <input v-model="editor.semester" class="field" placeholder="如：2024-2025学年第一学期" />
          <label class="field-label">状态</label>
          <select v-model="editor.status" class="select">
            <option>已启用</option>
            <option>未启用</option>
          </select>
          <p v-if="coursesPlaceholder" class="field-help">科目列表接口未接通。未接通前不能写入后端。</p>
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="editor = null">取消</button>
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import TablePager from '../components/TablePager.vue'
import { deleteClassCourse, getClassCoursesByClassId, updateClassCourse, batchCreateClassCourses } from '../api/classCourse.js'
import { fetchCourses, listClassCourses } from '../api/course.js'
import { fetchClasses } from '../api/student.js'
import { pageRecords, unwrapData } from '../api/unwrap.js'
import { PLACEHOLDER_ROW, actionError, useListShell } from '../composables/useListShell.js'
import { useAuthStore } from '../stores/auth.js'
import { useCampusStore } from '../stores/campus.js'
import { useUiStore } from '../stores/ui.js'

const auth = useAuthStore()
const campus = useCampusStore()
const ui = useUiStore()
const classes = ref([])
const classId = ref('')
const keyword = ref('')
const courses = ref([])
const coursesPlaceholder = ref(false)
const rows = ref([])
const selectedId = ref('')
const editor = ref(null)
const formError = ref('')
const {
  page,
  loading,
  loadError,
  usingPlaceholder,
  pageCount,
  pageList,
  summary,
  netHint,
  markPlaceholder,
  markReady,
  pageSize
} = useListShell()

const filtered = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((item) => `${item.courseCode}${item.courseName}${item.teacherName}`.toLowerCase().includes(query))
})

const preview = computed(() => {
  if (editor.value) {
    const picked = courses.value.filter((item) => editor.value.courseIds?.includes(item.id))
    const courseLabel = editor.value.id
      ? `${editor.value.courseCode || ''} ${editor.value.courseName || ''}`.trim()
      : picked.map((item) => item.name).join('、')
    return {
      courseLabel,
      academicYear: editor.value.academicYear,
      semester: editor.value.semester,
      status: editor.value.status
    }
  }
  const item = filtered.value.find((row) => row.id === selectedId.value)
  if (!item) return null
  return {
    courseLabel: `${item.courseCode || ''} ${item.courseName || ''}`.trim(),
    academicYear: item.academicYear,
    semester: item.semester,
    status: item.status
  }
})

function mapRow(raw) {
  const enabled = raw.status === 1 || raw.status === '1' || raw.status === '已启用' || raw.status === undefined
  return {
    id: raw.id,
    courseCode: raw.courseCode || raw.code || '',
    courseName: raw.courseName || raw.name || '',
    courseType: raw.courseType || raw.type || '',
    teacherName: raw.teacherName || raw.teacher || '',
    academicYear: raw.academicYear || '',
    semester: raw.semester || '',
    status: enabled ? '已启用' : '未启用'
  }
}

async function loadClasses() {
  try {
    const list = await fetchClasses()
    classes.value = list.map((item) => ({ ...item, placeholder: false }))
  } catch {
    classes.value = campus.classes.map((item) => ({ id: item.id, name: item.name, placeholder: true }))
  }
}

async function loadCourses() {
  try {
    const list = await fetchCourses()
    courses.value = list.map((item) => ({ id: item.id, code: item.code || item.id, name: item.name, placeholder: false }))
    coursesPlaceholder.value = false
  } catch {
    courses.value = []
    coursesPlaceholder.value = true
  }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    let list = []
    let count = 0
    if (classId.value && !classes.value.find((item) => String(item.id) === classId.value)?.placeholder) {
      const json = await getClassCoursesByClassId(classId.value)
      const data = unwrapData(json)
      list = Array.isArray(data) ? data : pageRecords(json).records
      count = list.length
    } else if (classId.value && classes.value.find((item) => String(item.id) === classId.value)?.placeholder) {
      throw new Error('网络不可用')
    } else {
      const parsed = pageRecords(await listClassCourses({ page: page.value, size: pageSize }))
      list = parsed.records
      count = parsed.total
    }
    rows.value = list.map(mapRow)
    markReady(count)
  } catch (error) {
    rows.value = []
    markPlaceholder(error)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  formError.value = ''
  editor.value = {
    id: '',
    courseIds: [],
    academicYear: '',
    semester: '',
    status: '已启用'
  }
}

function openEdit(item) {
  formError.value = ''
  editor.value = { ...item, courseIds: [] }
}

async function save() {
  formError.value = ''
  if (!editor.value.id && !editor.value.courseIds.length) {
    formError.value = courses.value.length ? '请至少选择一个科目' : '暂无可用科目，请先在科目管理中创建科目'
    return
  }
  if (!editor.value.id && !classId.value) {
    formError.value = '请先在上方选择班级'
    return
  }
  if (!editor.value.id && coursesPlaceholder.value) {
    formError.value = '科目接口未接通，未写入后端'
    return
  }
  try {
    if (editor.value.id) {
      await updateClassCourse(editor.value.id, {
        academicYear: editor.value.academicYear.trim(),
        semester: editor.value.semester.trim(),
        status: editor.value.status === '未启用' ? 0 : 1
      })
    } else {
      await batchCreateClassCourses(classId.value, editor.value.courseIds)
    }
    ui.toast('授课科目已保存', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = actionError(error, '网络不可用，未写入后端')
  }
}

async function remove(item) {
  if (!window.confirm(`删除授课科目「${item.courseName || item.courseCode}」？`)) return
  try {
    await deleteClassCourse(item.id)
    ui.toast('已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(actionError(error, '网络不可用，未删除'), 'error')
  }
}

onMounted(async () => {
  await Promise.all([loadClasses(), loadCourses()])
  await load()
})
watch(page, load)
watch(classId, () => {
  selectedId.value = ''
  if (page.value !== 1) page.value = 1
  else load()
})
</script>

<style scoped>
.course-picks {
  display: grid;
  gap: 8px;
  max-height: 180px;
  overflow: auto;
  padding: 8px 0;
}
</style>
