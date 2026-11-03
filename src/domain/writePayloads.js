/** 二期写路径的请求体。只组后端已有字段，不在这里假装保存成功。 */

const STUDENT_STATUS = { 休学: 0, 在读: 1, 毕业: 2, 退学: 3 }

export const ROLE_USER_TYPE = { ADMIN: 3, ACADEMIC: 2, TEACHER: 2, STUDENT: 1 }

export const EXCEPTION_TYPES = ['LATE', 'EARLY_LEAVE', 'PERSONAL_LEAVE', 'SICK_LEAVE', 'ABSENT']

export const EXCEPTION_LABEL = {
  LATE: '迟到',
  EARLY_LEAVE: '早退',
  PERSONAL_LEAVE: '事假',
  SICK_LEAVE: '病假',
  ABSENT: '旷课'
}

export function validateStudent(form) {
  const errors = []
  if (!String(form?.studentNo || '').trim()) errors.push('学号不能为空')
  if (!String(form?.name || '').trim()) errors.push('姓名不能为空')
  if (!form?.classId && !form?.className) errors.push('请选择班级')
  const phone = String(form?.phone || '').trim()
  if (phone && !/^1\d{10}$/.test(phone)) errors.push('手机号应为 11 位数字')
  return errors
}

export function studentWritePayload(form, classes = []) {
  const matched = classes.find((item) => {
    if (form.classId && String(item.id) === String(form.classId)) return true
    return form.className && item.name === form.className
  })
  const payload = {
    studentNo: String(form.studentNo || '').trim(),
    realName: String(form.name || '').trim(),
    gender: form.gender === '女' ? 2 : 1,
    phone: String(form.phone || '').trim(),
    status: STUDENT_STATUS[form.status] ?? 1
  }
  const classId = matched?.id ?? form.classId
  const gradeId = matched?.gradeId ?? form.gradeId
  const grade = matched?.grade || form.grade
  const className = matched?.name || form.className
  if (classId) payload.classId = classId
  if (gradeId) payload.gradeId = gradeId
  if (grade) payload.grade = grade
  if (className) payload.className = className
  return payload
}

export function validateUser(form, { creating = false } = {}) {
  const errors = []
  if (!String(form?.account || '').trim()) errors.push('账号不能为空')
  if (!String(form?.name || '').trim()) errors.push('姓名不能为空')
  if (!ROLE_USER_TYPE[form?.role]) errors.push('请选择身份')
  const password = String(form?.password || '')
  if (creating && password && password.length < 6) errors.push('初始密码至少 6 位')
  return errors
}

export function userCreatePayload(form) {
  const payload = {
    username: String(form.account || '').trim(),
    realName: String(form.name || '').trim(),
    userType: ROLE_USER_TYPE[form.role] ?? 2,
    status: 1
  }
  const phone = String(form.phone || '').trim()
  const email = String(form.email || '').trim()
  const password = String(form.password || '').trim()
  if (phone) payload.phone = phone
  if (email) payload.email = email
  if (password) payload.password = password
  return payload
}

/** 编辑不带密码，避免把初始密码写回去。 */
export function userUpdatePayload(form) {
  return {
    username: String(form.account || '').trim(),
    realName: String(form.name || '').trim(),
    userType: ROLE_USER_TYPE[form.role] ?? form.userType ?? 2,
    phone: String(form.phone || '').trim(),
    email: String(form.email || '').trim()
  }
}

export function roleCodesPayload(role) {
  return { roleCodes: [role] }
}

export function userIdentity(raw, roleCodes = []) {
  const code = roleCodes.find((item) => ROLE_USER_TYPE[item])
  if (code) {
    const title = { ADMIN: '管理员', ACADEMIC: '教务', TEACHER: '教师', STUDENT: '学生' }[code]
    return { role: code, title }
  }
  if (raw?.userType === 3) return { role: 'ADMIN', title: '管理员' }
  if (raw?.userType === 1) return { role: 'STUDENT', title: '学生' }
  if (raw?.userType === 2) return { role: '', title: '教职工' }
  return { role: '', title: '—' }
}

export function toUserRow(raw, roleCodes = []) {
  const identity = userIdentity(raw, roleCodes)
  return {
    id: raw.id,
    account: raw.username || raw.account || '',
    name: raw.realName || raw.name || '',
    role: identity.role,
    title: identity.title,
    roleCodes,
    userType: raw.userType,
    phone: raw.phone || '',
    email: raw.email || '',
    status: raw.status === 0 || raw.status === '停用' ? '停用' : '启用'
  }
}

export function validateCourse(form) {
  const errors = []
  if (!String(form?.code || '').trim()) errors.push('课程编号不能为空')
  if (!String(form?.name || '').trim()) errors.push('课程名称不能为空')
  return errors
}

export function courseWritePayload(form) {
  const payload = {
    courseCode: String(form.code || '').trim(),
    courseName: String(form.name || '').trim(),
    status: form.status ?? 1
  }
  if (form.credit !== '' && form.credit !== undefined && form.credit !== null) {
    payload.credit = Number(form.credit)
  }
  if (form.id) payload.id = form.id
  return payload
}

function slotOf(raw) {
  return {
    weekday: Number(raw.weekday || raw.weekDay || 0),
    periodStart: Number(raw.periodStart || 0),
    periodEnd: Number(raw.periodEnd || raw.periodStart || 0),
    roomNo: raw.roomNo || raw.room || ''
  }
}

export function validateClassCourse(form) {
  const errors = []
  if (!form?.classId) errors.push('请选择班级')
  if (!form?.courseId) errors.push('请选择课程库中的课程')
  const start = Number(form?.periodStart)
  const end = Number(form?.periodEnd)
  if (!start || !end || end < start) errors.push('结束节次不能早于开始节次')
  if (!String(form?.roomNo || '').trim()) errors.push('请填写教室')
  const day = Number(form?.weekday)
  if (day < 1 || day > 7) errors.push('星期必须是 1 到 7')
  return errors
}

export function classCourseWritePayload(form, siblings = []) {
  const current = slotOf(form)
  const sessions = siblings.length
    ? siblings.map((row) => (row.sessionIndex === form.sessionIndex ? current : slotOf(row)))
    : [current]
  const payload = {
    classId: Number(form.classId),
    courseId: Number(form.courseId),
    status: form.status ?? 1,
    sessions
  }
  if (form.academicYear) payload.academicYear = String(form.academicYear)
  if (form.semester !== '' && form.semester !== undefined && form.semester !== null) {
    payload.semester = String(form.semester)
  }
  if (form.teacherId) payload.teacherId = Number(form.teacherId)
  return payload
}

export function validateAttendanceRecord(form) {
  const errors = []
  if (!form?.classId) errors.push('请选择班级')
  if (!form?.studentId) errors.push('请选择学生')
  if (!form?.date) errors.push('请选择日期')
  if (!EXCEPTION_TYPES.includes(form?.exceptionType)) errors.push('请选择异常类型')
  return errors
}

export function attendanceRecordPayload(form) {
  const payload = {
    studentId: Number(form.studentId),
    attendanceDate: form.date,
    exceptionType: form.exceptionType,
    confirmStatus: form.confirmStatus || 'CONFIRMED'
  }
  if (form.classId) payload.classId = Number(form.classId)
  if (form.className) payload.className = form.className
  if (form.grade) payload.grade = form.grade
  if (form.courseId) payload.courseId = Number(form.courseId)
  if (form.summaryId) payload.summaryId = Number(form.summaryId)
  const reason = String(form.reason || '').trim()
  if (reason) payload.reasonDetail = reason
  return payload
}

export function validateAnnouncement(form) {
  const errors = []
  if (!String(form?.title || '').trim()) errors.push('标题不能为空')
  if (!String(form?.body || '').trim()) errors.push('正文不能为空')
  if (form?.scopeType && form.scopeType !== 'ALL' && !(form.scopeIds || []).length) {
    errors.push('请选择发布范围')
  }
  return errors
}

export function announcementWritePayload(form) {
  const scopeType = form.scopeType || 'ALL'
  const scopeIds = scopeType === 'ALL'
    ? []
    : (form.scopeIds || []).map((item) => Number(item)).filter((item) => item > 0)
  return {
    title: String(form.title || '').trim(),
    content: String(form.body || '').trim(),
    scopeType,
    scopeIds,
    isTop: form.pinned ? 1 : 0,
    status: form.status ?? 1
  }
}

export function validateGrade(form) {
  const errors = []
  if (!String(form?.gradeCode || '').trim()) errors.push('年级代码不能为空')
  if (!String(form?.gradeName || '').trim()) errors.push('年级名称不能为空')
  if (!['PRIMARY', 'JUNIOR', 'SENIOR'].includes(form?.gradeType)) errors.push('请选择年级类型')
  const level = Number(form?.gradeLevel)
  const max = form?.gradeType === 'PRIMARY' ? 6 : 3
  if (!level || level < 1 || level > max) errors.push(`年级级别必须是 1 到 ${max}`)
  return errors
}

export function gradeWritePayload(form) {
  const payload = {
    gradeCode: String(form.gradeCode || '').trim(),
    gradeName: String(form.gradeName || '').trim(),
    gradeType: form.gradeType,
    gradeLevel: Number(form.gradeLevel),
    status: form.status ?? 1
  }
  const description = String(form.description || '').trim()
  if (description) payload.description = description
  return payload
}

export function validateSchoolClass(form) {
  const errors = []
  if (!form?.gradeId) errors.push('请选择年级')
  if (!String(form?.classCode || '').trim()) errors.push('班级代码不能为空')
  if (!String(form?.className || '').trim()) errors.push('班级名称不能为空')
  const number = Number(form?.classNumber)
  if (!number || number < 1) errors.push('班级序号必须是正整数')
  return errors
}

export function classWritePayload(form) {
  const payload = {
    gradeId: Number(form.gradeId),
    classCode: String(form.classCode || '').trim(),
    className: String(form.className || '').trim(),
    classNumber: Number(form.classNumber),
    status: form.status ?? 1
  }
  if (form.capacity !== '' && form.capacity !== undefined && form.capacity !== null) {
    payload.capacity = Number(form.capacity)
  }
  if (form.headTeacherId) payload.headTeacherId = Number(form.headTeacherId)
  return payload
}
