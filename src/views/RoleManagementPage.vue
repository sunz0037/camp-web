<template>
  <div class="role-management-page bento-page">
    <div class="page-header">
      <h1>角色权限管理</h1>
      <button class="btn-primary" @click="handleCreate">新增角色</button>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <table class="data-table">
        <thead>
          <tr>
            <th>角色代码</th>
            <th>角色名称</th>
            <th>描述</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center">加载中...</td>
          </tr>
          <tr v-else-if="roleList.length === 0">
            <td colspan="6" class="text-center">暂无数据</td>
          </tr>
          <tr v-else v-for="role in roleList" :key="role.id">
            <td>{{ role.roleCode }}</td>
            <td>{{ role.roleName }}</td>
            <td>{{ role.description || '-' }}</td>
            <td>
              <span :class="role.status === 1 ? 'status-enabled' : 'status-disabled'">
                {{ role.status === 1 ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(role.createdAt) }}</td>
            <td>
              <button class="btn-edit" @click="handleEdit(role)">编辑</button>
              <button class="btn-permission" @click="handleAssignPermissions(role)">分配权限</button>
              <button class="btn-delete" @click="handleDelete(role)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination" v-if="total > 0">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页，共 {{ total }} 条</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h2>{{ dialogMode === 'create' ? '新增角色' : '编辑角色' }}</h2>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>角色代码 <span class="required">*</span></label>
              <input type="text" v-model="formData.roleCode" required placeholder="如：ADMIN" />
            </div>
            <div class="form-group">
              <label>角色名称 <span class="required">*</span></label>
              <input type="text" v-model="formData.roleName" required placeholder="如：系统管理员" />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="formData.description" rows="3" placeholder="角色描述"></textarea>
            </div>
            <div class="form-group">
              <label>状态 <span class="required">*</span></label>
              <select v-model="formData.status" required>
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeDialog">取消</button>
              <button type="submit" class="btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 分配权限对话框 -->
    <div v-if="showPermissionDialog" class="dialog-overlay" @click="closePermissionDialog">
      <div class="dialog-content dialog-content-large" @click.stop>
        <div class="dialog-header">
          <h2>分配权限 - {{ currentRole?.roleName }}</h2>
          <button class="btn-close" @click="closePermissionDialog">×</button>
        </div>
        <div class="dialog-body">
          <div v-if="loadingPermissions" class="text-center">加载权限列表中...</div>
          <div v-else-if="permissionTree.length === 0" class="text-center">暂无权限数据</div>
          <div v-else class="permission-tree">
            <div v-for="permission in permissionTree" :key="permission.id" class="permission-item">
              <label class="permission-label">
                <input 
                  type="checkbox" 
                  :value="permission.id" 
                  v-model="selectedPermissionIds"
                  @change="handlePermissionChange(permission)"
                />
                <span>{{ permission.permissionName }} ({{ permission.permissionCode }})</span>
              </label>
              <div v-if="permission.children && permission.children.length > 0" class="permission-children">
                <div v-for="child in permission.children" :key="child.id" class="permission-item-child">
                  <label class="permission-label">
                    <input 
                      type="checkbox" 
                      :value="child.id" 
                      v-model="selectedPermissionIds"
                    />
                    <span>{{ child.permissionName }} ({{ child.permissionCode }})</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closePermissionDialog">取消</button>
            <button type="button" class="btn-primary" @click="handleSavePermissions">保存</button>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import * as roleAPI from '../api/role.js'
import * as permissionAPI from '../api/permission.js'
import Toast from '../components/Toast.vue'

const loading = ref(false)
const loadingPermissions = ref(false)
const roleList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const showPermissionDialog = ref(false)
const dialogMode = ref('create')
const currentRole = ref(null)
const permissionList = ref([])
const selectedPermissionIds = ref([])

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
  roleCode: '',
  roleName: '',
  description: '',
  status: 1
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 构建权限树
const permissionTree = computed(() => {
  const tree = []
  const map = new Map()
  
  // 先创建所有节点的映射
  permissionList.value.forEach(permission => {
    map.set(permission.id, { ...permission, children: [] })
  })
  
  // 构建树形结构
  permissionList.value.forEach(permission => {
    const node = map.get(permission.id)
    if (permission.parentId === null || permission.parentId === 0) {
      tree.push(node)
    } else {
      const parent = map.get(permission.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        // 如果找不到父节点，作为根节点
        tree.push(node)
      }
    }
  })
  
  return tree
})

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return date
}

// 加载权限列表
const loadPermissions = async () => {
  loadingPermissions.value = true
  try {
    const result = await permissionAPI.getPermissionList()
    if (result.code === 200 && result.data) {
      permissionList.value = result.data || []
    }
  } catch (error) {
    console.error('加载权限列表失败：', error)
    showToast('加载权限列表失败：' + error.message, 'error')
  } finally {
    loadingPermissions.value = false
  }
}

onMounted(() => {
  loadData()
  loadPermissions()
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await roleAPI.getRoleList({
      page: currentPage.value,
      size: pageSize.value
    })
    
    if (result.code === 200 && result.data) {
      roleList.value = result.data.records || []
      total.value = result.data.total || 0
    }
  } catch (error) {
    showToast('加载数据失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadData()
  }
}

const handleCreate = () => {
  dialogMode.value = 'create'
  formData.value = {
    roleCode: '',
    roleName: '',
    description: '',
    status: 1
  }
  showDialog.value = true
}

const handleEdit = async (role) => {
  dialogMode.value = 'edit'
  try {
    const result = await roleAPI.getRoleDetail(role.id)
    if (result.code === 200 && result.data) {
      const data = result.data
      formData.value = {
        id: data.id,
        roleCode: data.roleCode,
        roleName: data.roleName,
        description: data.description || '',
        status: data.status
      }
      showDialog.value = true
    }
  } catch (error) {
    showToast('加载角色详情失败：' + error.message, 'error')
  }
}

const handleDelete = async (role) => {
  if (!confirm(`确定要删除角色"${role.roleName}"吗？`)) {
    return
  }
  
  try {
    await roleAPI.deleteRole(role.id)
    showToast('删除成功', 'success')
    loadData()
  } catch (error) {
    showToast('删除失败：' + error.message, 'error')
  }
}

const handleAssignPermissions = async (role) => {
  currentRole.value = role
  selectedPermissionIds.value = []
  
  // 加载角色详情以获取已分配的权限
  try {
    const result = await roleAPI.getRoleDetail(role.id)
    if (result.code === 200 && result.data) {
      // 如果角色详情中包含权限列表，设置已选中的权限
      if (result.data.permissions) {
        selectedPermissionIds.value = result.data.permissions.map(p => p.id)
      }
    }
  } catch (error) {
    console.error('加载角色权限失败：', error)
  }
  
  showPermissionDialog.value = true
}

const handlePermissionChange = (permission) => {
  // 如果选中父节点，自动选中所有子节点
  if (selectedPermissionIds.value.includes(permission.id)) {
    if (permission.children) {
      permission.children.forEach(child => {
        if (!selectedPermissionIds.value.includes(child.id)) {
          selectedPermissionIds.value.push(child.id)
        }
      })
    }
  } else {
    // 如果取消父节点，自动取消所有子节点
    if (permission.children) {
      permission.children.forEach(child => {
        const index = selectedPermissionIds.value.indexOf(child.id)
        if (index > -1) {
          selectedPermissionIds.value.splice(index, 1)
        }
      })
    }
  }
}

const handleSavePermissions = async () => {
  if (!currentRole.value) {
    return
  }
  
  try {
    await roleAPI.assignPermissions(currentRole.value.id, selectedPermissionIds.value)
    showToast('权限分配成功', 'success')
    closePermissionDialog()
  } catch (error) {
    showToast('权限分配失败：' + error.message, 'error')
  }
}

const handleSubmit = async () => {
  // 验证必填字段
  if (!formData.value.roleCode) {
    showToast('请输入角色代码', 'error')
    return
  }
  if (!formData.value.roleName) {
    showToast('请输入角色名称', 'error')
    return
  }
  
  try {
    if (dialogMode.value === 'create') {
      await roleAPI.createRole(formData.value)
      showToast('创建成功', 'success')
    } else {
      await roleAPI.updateRole(formData.value.id, formData.value)
      showToast('更新成功', 'success')
    }
    closeDialog()
    loadData()
  } catch (error) {
    showToast('操作失败：' + (error.message || '未知错误'), 'error')
  }
}

const closeDialog = () => {
  showDialog.value = false
}

const closePermissionDialog = () => {
  showPermissionDialog.value = false
  currentRole.value = null
  selectedPermissionIds.value = []
}
</script>

