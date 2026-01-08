import { API_BASE_URL } from '../config/api.js'

/**
 * 考试安排API服务
 */
class ExamScheduleAPI {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * 发送请求
   */
  async request(url, options = {}) {
    const token = localStorage.getItem('token')
    const userInfoStr = localStorage.getItem('userInfo')
    let userId = null
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        userId = userInfo.id
      } catch (e) {
        console.error('解析用户信息失败:', e)
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // 添加用户ID到请求头（临时方案）
    if (userId) {
      headers['X-User-Id'] = userId
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        headers,
        ...options
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API请求失败:', response.status, response.statusText, errorText)
        throw new Error(`请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.code !== undefined && data.code !== 200) {
        throw new Error(data.message || '请求失败')
      }

      return data
    } catch (error) {
      console.error('API请求异常:', error)
      throw error
    }
  }

  /**
   * 分页查询考试安排
   */
  async list(params = {}) {
    const {
      page = 1,
      size = 10,
      targetGrade,
      examType,
      isPublic,
      status,
      keyword
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    })
    
    if (targetGrade) queryParams.append('targetGrade', targetGrade)
    if (examType) queryParams.append('examType', examType)
    if (isPublic !== undefined) queryParams.append('isPublic', isPublic.toString())
    if (status !== undefined) queryParams.append('status', status.toString())
    if (keyword) queryParams.append('keyword', keyword)

    return this.request(`/api/exam-schedules?${queryParams.toString()}`)
  }

  /**
   * 根据ID查询考试安排
   */
  async getById(id) {
    return this.request(`/api/exam-schedules/${id}`)
  }

  /**
   * 创建考试安排
   */
  async create(data) {
    return this.request('/api/exam-schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * 更新考试安排
   */
  async update(id, data) {
    return this.request(`/api/exam-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * 删除考试安排
   */
  async delete(id) {
    return this.request(`/api/exam-schedules/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * 取消考试安排
   */
  async cancel(id) {
    return this.request(`/api/exam-schedules/${id}/cancel`, {
      method: 'PUT'
    })
  }
}

export default new ExamScheduleAPI()

