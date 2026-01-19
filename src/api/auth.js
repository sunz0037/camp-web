import { API_BASE_URL, API_ENDPOINTS } from '../config/api.js'

/**
 * 认证API服务
 */
class AuthAPI {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * 发送请求
   */
  async request(url, options = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()
    
    if (!response.ok || data.code !== 200) {
      throw new Error(data.message || '请求失败')
    }

    return data
  }

  /**
   * 用户登录
   * @param {Object} loginData - 登录数据
   * @param {number} loginData.identityType - 身份类型：1-学生，2-教工，3-家长/访客
   * @param {string} loginData.identifier - 唯一标识：学号（学生）或工号（教工）
   * @param {string} loginData.realName - 真实姓名（首次登录时必填）
   * @param {string} loginData.password - 密码（正常登录时必填）
   * @returns {Promise<Object>} 登录响应
   */
  async login(loginData) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(loginData)
    })
  }

  /**
   * 激活用户（首次登录设置密码）
   * @param {Object} activateData - 激活数据
   * @param {number} activateData.identityType - 身份类型：1-学生，2-教工
   * @param {string} activateData.identifier - 唯一标识：学号（学生）或工号（教工）
   * @param {string} activateData.realName - 真实姓名
   * @param {string} activateData.password - 新密码（至少6位）
   * @returns {Promise<Object>} 激活响应
   */
  async activate(activateData) {
    return this.request(API_ENDPOINTS.ACTIVATE, {
      method: 'POST',
      body: JSON.stringify(activateData)
    })
  }

  /**
   * 用户登出
   */
  async logout() {
    return this.request(API_ENDPOINTS.LOGOUT, {
      method: 'POST'
    })
  }

  /**
   * 修改密码
   * @param {number} userId - 用户ID
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   */
  async changePassword(userId, oldPassword, newPassword) {
    return this.request(`${API_ENDPOINTS.CHANGE_PASSWORD}?userId=${userId}&oldPassword=${oldPassword}&newPassword=${newPassword}`, {
      method: 'PUT'
    })
  }

  /**
   * 发送验证码（教工使用）
   * @param {Object} data - 发送验证码数据
   * @param {number} data.identityType - 身份类型：2-教工
   * @param {string} data.identifier - 工号
   * @param {string} data.realName - 真实姓名
   * @param {string} data.phone - 手机号
   * @returns {Promise<Object>} 发送结果
   */
  async sendVerificationCode(data) {
    return this.request('/api/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 重置密码
   * @param {Object} data - 重置密码数据
   * @param {number} data.identityType - 身份类型：1-学生，2-教工
   * @param {string} data.identifier - 学号/工号
   * @param {string} data.realName - 真实姓名
   * @param {string} data.idCard - 身份证号（学生必填）
   * @param {string} data.contactName - 应急联系人姓名（学生必填）
   * @param {string} data.contactPhone - 应急联系人电话（学生必填）
   * @param {string} data.relationship - 关系（学生必填）
   * @param {string} data.phone - 手机号（教工必填）
   * @param {string} data.verificationCode - 验证码（教工必填）
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(data) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 获取当前用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  async getCurrentUser(userId) {
    return this.request('/api/auth/me', {
      method: 'GET',
      headers: {
        'X-User-Id': userId
      }
    })
  }
}

export default new AuthAPI()

