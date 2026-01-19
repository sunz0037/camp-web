<template>
  <div class="emergency-contact-management-page">
    <div class="page-header">
      <h1>应急联系人管理</h1>
      <button class="btn-primary" @click="handleCreate">新增应急联系人</button>
    </div>

    <!-- 学生选择 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>选择学生：</label>
        <select v-model="selectedStudentId" @change="loadContacts" :disabled="loadingStudents">
          <option :value="null">请选择学生</option>
          <option v-for="student in studentOptions" :key="student.id" :value="student.id">
            {{ getStudentDisplayName(student) }}
          </option>
        </select>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section" v-if="selectedStudentId">
      <table class="data-table">
        <thead>
          <tr>
            <th>联系人姓名</th>
            <th>关系</th>
            <th>电话</th>
            <th>备用电话</th>
            <th>地址</th>
            <th>主要联系人</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="contactList.length === 0">
            <td colspan="7" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="contact in contactList" :key="contact.id">
            <td>{{ contact.contactName }}</td>
            <td>{{ contact.relationship }}</td>
            <td>{{ contact.phone }}</td>
            <td>{{ contact.alternatePhone || '-' }}</td>
            <td>{{ contact.address || '-' }}</td>
            <td>
              <span v-if="contact.isPrimary === 1" class="primary-badge">主要联系人</span>
              <span v-else>-</span>
            </td>
            <td>
              <button class="btn-edit" @click="handleEdit(contact)">编辑</button>
              <button 
                v-if="contact.isPrimary !== 1" 
                class="btn-primary-contact" 
                @click="handleSetPrimary(contact)"
              >
                设为主要
              </button>
              <button class="btn-delete" @click="handleDelete(contact)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 提示信息 -->
    <div v-else class="empty-state">
      <p>请先选择学生</p>
    </div>

    <!-- 新增/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ dialogMode === 'create' ? '新增应急联系人' : '编辑应急联系人' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>学生 <span class="required">*</span></label>
              <select v-model="formData.studentId" required :disabled="dialogMode === 'edit'">
                <option :value="null">请选择学生</option>
                <option v-for="student in studentOptions" :key="student.id" :value="student.id">
                  {{ getStudentDisplayName(student) }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>联系人姓名 <span class="required">*</span></label>
                <input type="text" v-model="formData.contactName" required placeholder="联系人姓名" />
              </div>
              <div class="form-group form-group-half">
                <label>关系 <span class="required">*</span></label>
                <select v-model="formData.relationship" required>
                  <option value="">请选择</option>
                  <option value="父亲">父亲</option>
                  <option value="母亲">母亲</option>
                  <option value="监护人">监护人</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group form-group-half">
                <label>电话 <span class="required">*</span></label>
                <input type="tel" v-model="formData.phone" required placeholder="11位手机号" maxlength="11" />
              </div>
              <div class="form-group form-group-half">
                <label>备用电话</label>
                <input type="tel" v-model="formData.alternatePhone" placeholder="备用电话（可选）" maxlength="11" />
              </div>
            </div>
            <div class="form-group">
              <label>地址</label>
              <textarea v-model="formData.address" rows="2" placeholder="地址（可选）"></textarea>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="formData.isPrimary" :true-value="1" :false-value="0" />
                设为主要联系人
              </label>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeDialog">取消</button>
              <button type="submit" class="btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Toast
      v-model:visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as emergencyContactAPI from '../api/emergencyContact.js'
import * as studentAPI from '../api/student.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const loadingStudents = ref(false)
const contactList = ref([])
const studentOptions = ref([])
const selectedStudentId = ref(null)
const showDialog = ref(false)
const dialogMode = ref('create')

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
}

const formData = ref({
  studentId: null,
  contactName: '',
  relationship: '',
  phone: '',
  alternatePhone: '',
  address: '',
  isPrimary: 0
})

// 获取学生显示名称
const getStudentDisplayName = (student) => {
  if (student.realName) {
    return `${student.realName}（${student.studentNo}）`
  }
  return student.studentNo || '-'
}

// 加载学生列表
const loadStudentOptions = async () => {
  loadingStudents.value = true
  try {
    const result = await studentAPI.getStudentList({ page: 1, size: 1000 })
    if (result.code === 200 && result.data) {
      studentOptions.value = result.data.records || []
    }
  } catch (error) {
    showToast('加载学生列表失败：' + error.message, 'error')
  } finally {
    loadingStudents.value = false
  }
}

// 加载应急联系人列表
const loadContacts = async () => {
  if (!selectedStudentId.value) {
    contactList.value = []
    return
  }

  loading.value = true
  try {
    const result = await emergencyContactAPI.getEmergencyContactsByStudentId(selectedStudentId.value)
    if (result.code === 200 && result.data) {
      contactList.value = result.data || []
    }
  } catch (error) {
    showToast('加载应急联系人列表失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

// 新增
const handleCreate = () => {
  if (!selectedStudentId.value) {
    showToast('请先选择学生', 'error')
    return
  }

  dialogMode.value = 'create'
  formData.value = {
    studentId: selectedStudentId.value,
    contactName: '',
    relationship: '',
    phone: '',
    alternatePhone: '',
    address: '',
    isPrimary: 0
  }
  showDialog.value = true
}

// 编辑
const handleEdit = (contact) => {
  dialogMode.value = 'edit'
  formData.value = {
    id: contact.id,
    studentId: contact.studentId,
    contactName: contact.contactName || '',
    relationship: contact.relationship || '',
    phone: contact.phone || '',
    alternatePhone: contact.alternatePhone || '',
    address: contact.address || '',
    isPrimary: contact.isPrimary || 0
  }
  showDialog.value = true
}

// 设置主要联系人
const handleSetPrimary = async (contact) => {
  if (!confirm(`确定要将"${contact.contactName}"设为主要联系人吗？`)) {
    return
  }

  try {
    await emergencyContactAPI.setPrimaryContact(contact.studentId, contact.id)
    showToast('设置成功', 'success')
    loadContacts()
  } catch (error) {
    showToast('设置失败：' + error.message, 'error')
  }
}

// 删除
const handleDelete = async (contact) => {
  if (!confirm(`确定要删除应急联系人"${contact.contactName}"吗？`)) {
    return
  }

  try {
    await emergencyContactAPI.deleteEmergencyContact(contact.id)
    showToast('删除成功', 'success')
    loadContacts()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

// 提交表单
const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.studentId) {
    showToast('请选择学生', 'error')
    return
  }
  if (!formData.value.contactName) {
    showToast('请输入联系人姓名', 'error')
    return
  }
  if (!formData.value.phone) {
    showToast('请输入电话', 'error')
    return
  }
  if (!formData.value.relationship) {
    showToast('请选择关系', 'error')
    return
  }

  try {
    const data = { ...formData.value }
    if (!data.alternatePhone) {
      data.alternatePhone = null
    }
    if (!data.address) {
      data.address = null
    }

    if (dialogMode.value === 'create') {
      await emergencyContactAPI.createEmergencyContact(data)
      showToast('创建成功', 'success')
    } else {
      await emergencyContactAPI.updateEmergencyContact(data.id, data)
      showToast('更新成功', 'success')
    }
    closeDialog()
    loadContacts()
  } catch (error) {
    showToast('操作失败：' + (error.message || '未知错误'), 'error')
  }
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

onMounted(() => {
  loadStudentOptions()
})
</script>

<style scoped>
.emergency-contact-management-page {
  padding: 2rem;
  background: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #0077ed;
}

.filter-section {
  background: #fafafa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: #6e6e73;
  white-space: nowrap;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 200px;
}

.table-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #fafafa;
}

.data-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #000000;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1d1d1f;
}

.data-table tbody tr:hover {
  background: #f5f5f7;
}

.text-center {
  text-align: center;
  color: #6e6e73;
}

.primary-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #34c759;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}

.btn-edit,
.btn-delete,
.btn-primary-contact {
  padding: 0.25rem 0.75rem;
  margin-right: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8125rem;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #ffffff;
  color: #0071e3;
}

.btn-edit:hover {
  background: #f5f5f7;
}

.btn-primary-contact {
  background: #ffffff;
  color: #34c759;
}

.btn-primary-contact:hover {
  background: #f5f5f7;
}

.btn-delete {
  background: #ffffff;
  color: #d32f2f;
}

.btn-delete:hover {
  background: #f5f5f7;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6e6e73;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #000000;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6e6e73;
}

.dialog-body {
  padding: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
  flex: 1;
}

.form-group-half {
  flex: 0 0 calc(50% - 0.5rem);
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #1d1d1f;
  font-weight: 500;
}

.required {
  color: #ff3b30;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-actions button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-actions button[type="button"] {
  background: #ffffff;
  color: #1d1d1f;
}

.form-actions button[type="button"]:hover {
  background: #f5f5f7;
}

.form-actions .btn-primary {
  background: #000000;
  color: white;
  border-color: #000000;
}

.form-actions .btn-primary:hover {
  background: #333333;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-group-half {
    flex: 1 1 100%;
  }
}
</style>
