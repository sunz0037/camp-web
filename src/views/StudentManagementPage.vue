<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>学生信息</h1>
        <p>所辖班级名册 · 筛选与批量操作</p>
        <p class="scope-line">数据范围 · {{ scopeText }}</p>
      </div>
      <div class="head-actions">
        <button v-if="auth.can('student:import')" class="btn btn-warn" type="button" @click="openImport = true">
          <AppIcon name="Upload" :size="16" /> 导入
        </button>
        <button class="btn btn-ghost" type="button" @click="exportCsv">
          <AppIcon name="Download" :size="16" /> 导出
        </button>
        <button v-if="auth.can('student:write')" class="btn btn-primary" type="button" @click="openCreate">
          <AppIcon name="Plus" :size="16" /> 新增学生
        </button>
      </div>
    </header>

    <section class="card filters">
      <div class="seg">
        <button type="button" :class="{ active: grade === '全部年级' }" @click="setGrade('全部年级')">全部年级</button>
        <button v-for="item in ['高一', '高二', '高三']" :key="item" type="button" :class="{ active: grade === item }" @click="setGrade(item)">
          {{ item }}
        </button>
      </div>
      <input v-model="keyword" class="field" placeholder="搜索姓名 / 学号" />
    </section>

    <section class="card table-card">
      <p v-if="missing" class="sub" style="padding: 14px 16px 0">有 {{ missing }} 名学生尚未登记应急联系人。</p>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>学号</th>
              <th>姓名</th>
              <th>班级</th>
              <th>性别</th>
              <th>手机</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pageRows" :key="item.id">
              <td class="num">{{ item.studentNo }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.className }}</td>
              <td>{{ item.gender }}</td>
              <td class="num">{{ maskPhone(item.phone) }}</td>
              <td>
                <span class="pill" :class="item.status === '在读' ? 'pill-ok' : 'pill-warn'">{{ item.status }}</span>
              </td>
              <td>
                <button class="linkish" type="button" @click="openDetail(item)">详情</button>
                <button v-if="auth.can('student:write')" class="linkish" type="button" @click="openEdit(item)">编辑</button>
              </td>
            </tr>
            <tr v-if="!pageRows.length">
              <td colspan="7" class="muted">没有符合条件的学生</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-foot">
        <span>共 {{ filtered.length }} 名学生 · 显示 {{ rangeText }}</span>
        <div class="pager">
          <button type="button" :disabled="page === 1" @click="page -= 1">上一页</button>
          <template v-for="(n, index) in pageList" :key="n">
            <span v-if="index > 0 && n - pageList[index - 1] > 1">…</span>
            <button type="button" :class="{ active: n === page }" @click="page = n">{{ n }}</button>
          </template>
          <button type="button" :disabled="page === pageCount" @click="page += 1">下一页</button>
        </div>
      </div>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="saveStudent">
        <div class="modal-head">
          <h3>{{ editor.id ? '编辑学生' : '新增学生' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">学号</label>
          <input v-model="editor.studentNo" class="field num" :readonly="Boolean(editor.id)" required />
          <label class="field-label">姓名</label>
          <input v-model="editor.name" class="field" required />
          <div class="form-row">
            <div>
              <label class="field-label">性别</label>
              <select v-model="editor.gender" class="select">
                <option>男</option>
                <option>女</option>
              </select>
            </div>
            <div>
              <label class="field-label">学籍</label>
              <select v-model="editor.status" class="select">
                <option>在读</option>
                <option>休学</option>
              </select>
            </div>
          </div>
          <label class="field-label">班级</label>
          <select v-model="editor.className" class="select" required>
            <option v-for="item in classOptions" :key="item.id" :value="item.name">{{ item.name }}</option>
          </select>
          <label class="field-label">手机</label>
          <input v-model="editor.phone" class="field num" inputmode="numeric" />
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="editor = null">取消</button>
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="detail" class="drawer-mask" @click.self="detail = null">
      <aside class="drawer-card">
        <div class="drawer-head">
          <h3>{{ detail.name }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="detail = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <dl class="dl">
          <dt>学号</dt><dd class="num">{{ detail.studentNo }}</dd>
          <dt>班级</dt><dd>{{ detail.className }}</dd>
          <dt>性别</dt><dd>{{ detail.gender }}</dd>
          <dt>学籍</dt><dd>{{ detail.status }}</dd>
          <dt>手机</dt><dd class="num">{{ maskPhone(detail.phone) }}</dd>
        </dl>
        <h3 style="margin: 18px 0 8px; font-size: 16px">应急联系人</h3>
        <ul v-if="detailContacts.length" class="contact-list">
          <li v-for="item in detailContacts" :key="item.id">
            <span>{{ item.name }} · {{ item.relation }} · <span class="num">{{ maskPhone(item.phone) }}</span></span>
            <span v-if="item.primary" class="pill pill-ok">主要</span>
          </li>
        </ul>
        <p v-else class="sub">尚未登记应急联系人</p>
        <button v-if="auth.can('student:write')" class="btn btn-ghost" style="margin-top: 12px" type="button" @click="contactOpen = true">添加联系人</button>
      </aside>
    </div>

    <div v-if="contactOpen" class="modal-mask" @click.self="contactOpen = false">
      <form class="modal-card" @submit.prevent="saveContact">
        <div class="modal-head">
          <h3>添加应急联系人</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="contactOpen = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">姓名</label>
          <input v-model="contact.name" class="field" required />
          <label class="field-label">关系</label>
          <select v-model="contact.relation" class="select">
            <option>父亲</option>
            <option>母亲</option>
            <option>监护人</option>
            <option>其他</option>
          </select>
          <label class="field-label">手机</label>
          <input v-model="contact.phone" class="field num" required />
          <label class="check"><input v-model="contact.primary" type="checkbox" /> 设为主要联系人</label>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="openImport" class="modal-mask" @click.self="openImport = false">
      <form class="modal-card" @submit.prevent="doImport">
        <div class="modal-head">
          <h3>导入学生</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="openImport = false"><AppIcon name="X" :size="16" /></button>
        </div>
        <p class="sub" style="margin-top: 0">CSV 表头：学号,姓名,性别,班级,手机,学籍。仅可导入数据范围内的班级。</p>
        <input class="field" type="file" accept=".csv,text/csv" @change="onFile" />
        <p v-if="importError" class="error-text" style="margin-top: 8px">{{ importError }}</p>
        <div class="form-actions">
          <button class="btn btn-ghost" type="button" @click="downloadTemplate">下载模板</button>
          <button class="btn btn-warn" type="submit">开始导入</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'
import { useCampusStore } from '../stores/campus.js'
import { useUiStore } from '../stores/ui.js'
import { downloadText, maskPhone, scopeLabel } from '../utils/format.js'

const auth = useAuthStore()
const campus = useCampusStore()
const ui = useUiStore()
const grade = ref('全部年级')
const keyword = ref('')
const page = ref(1)
const pageSize = 5
const editor = ref(null)
const detail = ref(null)
const formError = ref('')
const openImport = ref(false)
const importRows = ref([])
const importError = ref('')
const contactOpen = ref(false)
const contact = reactive({ name: '', relation: '父亲', phone: '', primary: true })

const classOptions = computed(() => campus.classesFor(auth.user))
const scopeText = computed(() => scopeLabel(auth.user, classOptions.value.map((item) => item.name)))
const allowedClassNames = computed(() => classOptions.value.map((item) => item.name))
const missing = computed(() => campus.missingContactCount(auth.user))

const filtered = computed(() => {
  const query = keyword.value.trim()
  return campus.studentsFor(auth.user).filter((item) => {
    const gradeOk = grade.value === '全部年级' || item.grade === grade.value
    const text = `${item.name}${item.studentNo}`
    return gradeOk && (!query || text.includes(query))
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const pageList = computed(() => Array.from({ length: pageCount.value }, (_, index) => index + 1).filter((n) => {
  return n === 1 || n === pageCount.value || Math.abs(n - page.value) <= 1
}))
const rangeText = computed(() => {
  if (!filtered.value.length) return '0-0'
  const from = (page.value - 1) * pageSize + 1
  const to = Math.min(page.value * pageSize, filtered.value.length)
  return `${from}-${to}`
})
const detailContacts = computed(() => (detail.value ? campus.contactsFor(detail.value.id) : []))

watch(filtered, () => {
  if (page.value > pageCount.value) page.value = 1
})

function setGrade(value) {
  grade.value = value
  page.value = 1
}

function openCreate() {
  formError.value = ''
  editor.value = {
    id: '',
    studentNo: '',
    name: '',
    gender: '男',
    status: '在读',
    className: classOptions.value[0]?.name || '',
    phone: ''
  }
}

function openEdit(item) {
  formError.value = ''
  editor.value = { ...item }
}

function openDetail(item) {
  detail.value = item
}

function saveStudent() {
  formError.value = ''
  try {
    if (!allowedClassNames.value.includes(editor.value.className)) throw new Error('班级不在数据范围内')
    campus.saveStudent(editor.value)
    ui.toast('学生信息已保存', 'success')
    editor.value = null
  } catch (error) {
    formError.value = error.message
  }
}

function saveContact() {
  campus.saveContact({ ...contact, studentId: detail.value.id })
  contact.name = ''
  contact.phone = ''
  contactOpen.value = false
  ui.toast('已添加应急联系人', 'success')
}

function exportCsv() {
  const header = '学号,姓名,性别,班级,手机,学籍'
  const lines = filtered.value.map((item) => [item.studentNo, item.name, item.gender, item.className, item.phone, item.status].join(','))
  downloadText('学生名册.csv', [header, ...lines].join('\n'))
  ui.toast('已导出当前筛选结果', 'success')
}

function downloadTemplate() {
  downloadText('学生导入模板.csv', '学号,姓名,性别,班级,手机,学籍\n20241111,测试,男,高一(3)班,13800001111,在读\n')
}

function onFile(event) {
  const file = event.target.files?.[0]
  importRows.value = []
  importError.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    const lines = text.replace(/^\ufeff/, '').trim().split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) {
      importError.value = '文件里没有数据行'
      return
    }
    const header = lines[0].split(',').map((item) => item.trim())
    importRows.value = lines.slice(1).map((line) => {
      const cols = line.split(',').map((item) => item.trim())
      return Object.fromEntries(header.map((key, index) => [key, cols[index] || '']))
    })
  }
  reader.readAsText(file)
}

function doImport() {
  if (!importRows.value.length) {
    importError.value = '请先选择 CSV 文件'
    return
  }
  const result = campus.importStudents(importRows.value, allowedClassNames.value)
  ui.toast(`成功导入 ${result.success} 名学生`, 'success')
  importError.value = result.errors.slice(0, 3).join('；')
  if (!result.errors.length) openImport.value = false
}
</script>
