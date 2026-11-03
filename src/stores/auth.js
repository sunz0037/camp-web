import { defineStore } from 'pinia'
import { api, ApiError } from '../api/http.js'

export const ROLE_PERMISSIONS = {
  ADMIN: ['org:write', 'student:import', 'student:write', 'course:write', 'attendance:record', 'announcement:publish', 'user:write'],
  ACADEMIC: ['org:write', 'student:import', 'student:write', 'course:write', 'attendance:record', 'announcement:publish'],
  TEACHER: ['student:write', 'course:write', 'attendance:record', 'announcement:publish'],
  STUDENT: []
}

const ACCOUNTS_KEY = 'camp.accounts'

function defaultAccounts() {
  return [
    {
      id: 'u-admin',
      account: 'admin',
      password: 'Demo@123456',
      name: '系统管理员',
      role: 'ADMIN',
      actor: 'ADMIN',
      title: '管理员',
      employeeNo: 'admin',
      studentNo: '',
      phone: '13800000000',
      email: 'admin@school.edu',
      classNames: [],
      classIds: [],
      gradeIds: [],
      className: '',
      permissions: [...ROLE_PERMISSIONS.ADMIN],
      mustChangePassword: false,
      status: '启用'
    },
    {
      id: 'u-academic',
      account: 'academic01',
      password: 'Demo@123456',
      name: '周教务',
      role: 'ACADEMIC',
      actor: 'ACADEMIC',
      title: '教务',
      employeeNo: 'A1001',
      studentNo: '',
      phone: '13800001001',
      email: 'academic@school.edu',
      classNames: [],
      classIds: [],
      gradeIds: [],
      className: '',
      permissions: [...ROLE_PERMISSIONS.ACADEMIC],
      mustChangePassword: false,
      status: '启用'
    },
    {
      id: 't-wang',
      account: 'teacher01',
      password: 'Demo@123456',
      name: '王老师',
      role: 'TEACHER',
      actor: 'TEACHER',
      title: '教师',
      employeeNo: 'T1001',
      studentNo: '',
      phone: '13812345678',
      email: 'wang@school.edu',
      classNames: ['高一(2)班', '高一(3)班', '高二(1)班'],
      classIds: ['c12', 'c13', 'c21'],
      gradeIds: ['1', '2'],
      className: '',
      permissions: [...ROLE_PERMISSIONS.TEACHER],
      mustChangePassword: false,
      status: '启用'
    },
    {
      id: 'u-zhao',
      account: 'T1002',
      password: 'Demo@123456',
      name: '赵老师',
      role: 'TEACHER',
      actor: 'TEACHER',
      title: '教师',
      employeeNo: 'T1002',
      studentNo: '',
      phone: '13800001002',
      email: 'zhao@school.edu',
      classNames: ['高一(1)班'],
      classIds: ['c11'],
      gradeIds: ['1'],
      className: '',
      permissions: [...ROLE_PERMISSIONS.TEACHER],
      mustChangePassword: false,
      status: '启用'
    },
    {
      id: 'u-liming',
      account: 'student01',
      password: 'Demo@123456',
      name: '李明',
      role: 'STUDENT',
      actor: 'STUDENT',
      title: '学生',
      employeeNo: '',
      studentNo: '20240101',
      phone: '13812345678',
      email: 'liming@school.edu',
      classNames: [],
      classIds: ['c13'],
      gradeIds: ['1'],
      className: '高一(3)班',
      permissions: [],
      mustChangePassword: false,
      status: '启用'
    },
    {
      id: 'u-parent',
      account: 'P1001',
      password: 'Demo@123456',
      name: '李建国',
      role: 'STUDENT',
      actor: 'PARENT',
      title: '家长',
      employeeNo: '',
      studentNo: '20240101',
      phone: '13800001024',
      email: 'parent@school.edu',
      classNames: [],
      classIds: ['c13'],
      gradeIds: ['1'],
      className: '高一(3)班',
      linkedStudentName: '李明',
      permissions: [],
      mustChangePassword: false,
      status: '启用'
    },
    {
      id: 'u-new',
      account: 'newstu',
      password: 'Demo@123456',
      name: '周宁',
      role: 'STUDENT',
      actor: 'STUDENT',
      title: '学生',
      employeeNo: '',
      studentNo: '20240088',
      phone: '13800008888',
      email: '',
      classNames: [],
      classIds: ['c11'],
      gradeIds: ['1'],
      className: '高一(1)班',
      permissions: [],
      mustChangePassword: false,
      status: '启用'
    }
  ]
}

function publicUser(account) {
  const { password, ...user } = account
  return user
}

function persistAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function normalizeRole(role) {
  const value = String(role || 'STUDENT').toUpperCase()
  if (value === 'PARENT') return { role: 'STUDENT', actor: 'PARENT', title: '家长' }
  const title = { ADMIN: '管理员', ACADEMIC: '教务', TEACHER: '教师', STUDENT: '学生' }[value] || '学生'
  return { role: value === 'ADMIN' || value === 'ACADEMIC' || value === 'TEACHER' ? value : 'STUDENT', actor: value, title }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    refreshToken: '',
    user: null,
    accounts: []
  }),
  getters: {
    isAuthed: (state) => Boolean(state.accessToken && state.user)
  },
  actions: {
    hydrate() {
      try {
        const saved = localStorage.getItem(ACCOUNTS_KEY)
        this.accounts = saved ? JSON.parse(saved) : defaultAccounts()
      } catch {
        this.accounts = defaultAccounts()
      }
      const token = localStorage.getItem('token')
      const raw = localStorage.getItem('userInfo')
      if (!token || !raw) return
      try {
        const user = JSON.parse(raw)
        if (!user?.role || !user?.id) return
        this.accessToken = token
        this.refreshToken = localStorage.getItem('refreshToken') || ''
        this.user = user
      } catch {
        this.clearSession()
      }
    },
    can(code) {
      return Boolean(this.user?.permissions?.includes(code))
    },
    applySession(accessToken, refreshToken, user) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = user
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(user))
    },
    clearSession() {
      this.accessToken = ''
      this.refreshToken = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
    },
    async login({ account, password, portal }) {
      const identifier = account.trim()
      const payload = {
        account: identifier,
        username: identifier,
        identifier,
        password,
        portal,
        identityType: portal === 'student' ? 1 : 2
      }
      try {
        const json = await api('/api/v1/auth/login', { method: 'POST', auth: false, body: payload })
        const data = json.data && typeof json.data === 'object' ? json.data : json
        const remote = data.user || data.userInfo || {}
        const roleName = remote.role
          || ({ 1: 'STUDENT', 2: 'TEACHER', 3: 'ADMIN' }[remote.userType])
          || (portal === 'student' ? 'STUDENT' : identifier.toLowerCase() === 'admin' ? 'ADMIN' : identifier.toLowerCase().startsWith('academic') ? 'ACADEMIC' : 'TEACHER')
        const mapped = normalizeRole(roleName)
        const user = {
          id: remote.id || identifier,
          account: remote.account || remote.username || identifier,
          name: remote.name || remote.realName || identifier,
          role: mapped.role,
          actor: remote.actor || mapped.actor,
          title: remote.title || mapped.title,
          employeeNo: remote.employeeNo || '',
          studentNo: remote.studentNo || '',
          phone: remote.phone || '',
          email: remote.email || '',
          classNames: remote.classNames || [],
          classIds: remote.classIds || [],
          gradeIds: remote.gradeIds || [],
          className: remote.className || '',
          linkedStudentName: remote.linkedStudentName || '',
          permissions: remote.permissions || ROLE_PERMISSIONS[mapped.role] || [],
          mustChangePassword: Boolean(remote.mustChangePassword),
          status: '启用'
        }
        this.applySession(data.accessToken || data.token, data.refreshToken || '', user)
        return
      } catch (error) {
        if (!(error instanceof ApiError) || !error.network) throw error
      }

      const found = this.accounts.find((item) => item.account.toLowerCase() === identifier.toLowerCase())
      if (!found || found.password !== password) {
        throw new ApiError('账号或密码错误')
      }
      if (found.status === '停用') throw new ApiError('账号已停用，请联系管理员')
      const staff = ['ADMIN', 'ACADEMIC', 'TEACHER'].includes(found.role)
      if (portal === 'staff' && !staff) throw new ApiError('请从学生入口登录')
      if (portal === 'student' && staff) throw new ApiError('请从教职工入口登录')
      this.applySession(`mock.${found.id}`, `mock-refresh.${found.id}`, publicUser(found))
    },
    logout() {
      this.clearSession()
    },
    updateProfile({ phone, email }) {
      if (!this.user) return
      this.user = { ...this.user, phone, email }
      localStorage.setItem('userInfo', JSON.stringify(this.user))
      const index = this.accounts.findIndex((item) => item.id === this.user.id)
      if (index >= 0) {
        this.accounts[index] = { ...this.accounts[index], phone, email }
        persistAccounts(this.accounts)
      }
    },
    changePassword({ oldPassword, nextPassword }) {
      const record = this.accounts.find((item) => item.id === this.user?.id)
      if (record && record.password !== oldPassword) {
        throw new ApiError('当前密码不正确')
      }
      if (nextPassword.length < 6) throw new ApiError('新密码至少 6 位')
      if (record) {
        record.password = nextPassword
        record.mustChangePassword = false
        persistAccounts(this.accounts)
      }
      this.user = { ...this.user, mustChangePassword: false }
      localStorage.setItem('userInfo', JSON.stringify(this.user))
    },
    registerAccount(input) {
      const account = input.account.trim()
      if (this.accounts.some((item) => item.account.toLowerCase() === account.toLowerCase())) {
        throw new ApiError('账号已存在')
      }
      const mapped = normalizeRole(input.role)
      const role = input.role === 'PARENT' ? 'STUDENT' : mapped.role
      const actor = input.role === 'PARENT' ? 'PARENT' : role
      const created = {
        id: `u-${Date.now().toString(36)}`,
        account,
        password: input.password || 'Demo@123456',
        name: input.name.trim(),
        role,
        actor,
        title: actor === 'PARENT' ? '家长' : mapped.title,
        employeeNo: role === 'STUDENT' ? '' : account,
        studentNo: role === 'STUDENT' && actor !== 'PARENT' ? account : '',
        phone: input.phone || '',
        email: input.email || '',
        classNames: input.classNames || [],
        classIds: input.classIds || [],
        gradeIds: input.gradeIds || [],
        className: input.className || '',
        linkedStudentName: input.linkedStudentName || '',
        permissions: [...(ROLE_PERMISSIONS[role] || [])],
        mustChangePassword: false,
        status: '启用'
      }
      this.accounts.push(created)
      persistAccounts(this.accounts)
      return publicUser(created)
    },
    setAccountStatus(id, status) {
      const record = this.accounts.find((item) => item.id === id)
      if (!record) return
      record.status = status
      persistAccounts(this.accounts)
    }
  }
})
