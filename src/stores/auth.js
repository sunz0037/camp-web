import { defineStore } from 'pinia'
import { api, ApiError } from '../api/http.js'
import { changePassword as changePasswordApi } from '../api/password.js'
import { loginIdentity, normalizeRole, ROLE_PERMISSIONS } from '../domain/sessionIdentity.js'
import { useThemeStore } from './theme.js'

export { ROLE_PERMISSIONS }

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
        // PHASE2-BLOCKED: identityType=1 时 camp-app 只按学号查找。student01 是用户名，学号是 S20260001，学生入口用用户名会「账号或密码错误」。
        identityType: portal === 'student' ? 1 : 2
      }
      try {
        const json = await api('/api/v1/auth/login', { method: 'POST', auth: false, body: payload })
        const data = json.data && typeof json.data === 'object' ? json.data : json
        const remote = data.user || data.userInfo || {}
        const identity = loginIdentity({
          ...remote,
          roles: remote.roles ?? remote.roleCodes ?? data.roles ?? data.roleCodes ?? remote.role,
          permissions: remote.permissions ?? data.permissions
        }, { portal, identifier })
        const user = {
          id: remote.id || identifier,
          account: remote.account || remote.username || identifier,
          name: remote.name || remote.realName || identifier,
          role: identity.role,
          actor: remote.actor || identity.actor,
          title: identity.title,
          employeeNo: remote.employeeNo || '',
          studentNo: remote.studentNo || '',
          phone: remote.phone || '',
          email: remote.email || '',
          classNames: remote.classNames || [],
          classIds: remote.classIds || [],
          gradeIds: remote.gradeIds || [],
          className: remote.className || '',
          linkedStudentName: remote.linkedStudentName || '',
          permissions: identity.permissions,
          mustChangePassword: Boolean(remote.mustChangePassword),
          status: '启用'
        }
        this.applySession(data.accessToken || data.token, data.refreshToken || '', user)
        await useThemeStore().load()
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
      await useThemeStore().load()
    },
    logout() {
      this.clearSession()
      useThemeStore().apply('default')
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
    async changePassword({ oldPassword, nextPassword }) {
      if (!nextPassword || nextPassword.length < 6) throw new ApiError('新密码至少 6 位')
      await changePasswordApi({ oldPassword, newPassword: nextPassword })
      const record = this.accounts.find((item) => item.id === this.user?.id)
      if (record) {
        record.password = nextPassword
        record.mustChangePassword = false
        persistAccounts(this.accounts)
      }
      if (this.user) {
        this.user = { ...this.user, mustChangePassword: false }
        localStorage.setItem('userInfo', JSON.stringify(this.user))
      }
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
