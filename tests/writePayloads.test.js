import assert from 'node:assert/strict'
import test from 'node:test'
import {
  announcementWritePayload,
  attendanceRecordPayload,
  classCourseWritePayload,
  classWritePayload,
  courseWritePayload,
  gradeWritePayload,
  studentWritePayload,
  userCreatePayload,
  userUpdatePayload,
  validateAnnouncement,
  validateAttendanceRecord,
  validateClassCourse,
  validateStudent,
  validateUser
} from '../src/domain/writePayloads.js'

test('学生提交带班级 id，并校验手机号', () => {
  const classes = [{ id: 13, name: '高一(3)班', grade: '高一', gradeId: 1 }]
  const payload = studentWritePayload({
    studentNo: '20241111',
    name: '测试',
    gender: '女',
    className: '高一(3)班',
    phone: '13800001111',
    status: '在读'
  }, classes)
  assert.equal(payload.classId, 13)
  assert.equal(payload.gradeId, 1)
  assert.equal(payload.gender, 2)
  assert.equal(payload.status, 1)
  assert.deepEqual(validateStudent({ studentNo: '1', name: '测', className: '高一(3)班', phone: '123' }), ['手机号应为 11 位数字'])
})

test('用户新增带初始密码，编辑不带密码', () => {
  const created = userCreatePayload({
    account: 'teacher02',
    name: '陈老师',
    role: 'TEACHER',
    password: 'Demo@123456'
  })
  assert.equal(created.username, 'teacher02')
  assert.equal(created.password, 'Demo@123456')
  assert.equal(created.userType, 2)
  const updated = userUpdatePayload({
    account: 'teacher02',
    name: '陈老师',
    role: 'ACADEMIC',
    password: 'should-not-send'
  })
  assert.equal(updated.userType, 2)
  assert.equal('password' in updated, false)
  assert.deepEqual(validateUser({ account: '', name: 'a', role: 'TEACHER' }, { creating: true }), ['账号不能为空'])
})

test('班级授课必须带班级和课程', () => {
  assert.ok(validateClassCourse({ classId: '', courseId: 1, weekday: 1, periodStart: 1, periodEnd: 2, roomNo: 'A1' }).includes('请选择班级'))
  const payload = classCourseWritePayload({
    classId: '3',
    courseId: '8',
    teacherId: '2',
    academicYear: '2026-2027',
    semester: 1,
    weekday: 1,
    periodStart: 1,
    periodEnd: 2,
    roomNo: 'A101',
    sessionIndex: 0
  }, [
    { sessionIndex: 0, weekday: 1, periodStart: 1, periodEnd: 2, roomNo: 'A101' },
    { sessionIndex: 1, weekday: 3, periodStart: 3, periodEnd: 4, roomNo: 'B2' }
  ])
  assert.equal(payload.classId, 3)
  assert.equal(payload.courseId, 8)
  assert.equal(payload.teacherId, 2)
  assert.equal(payload.sessions.length, 2)
  assert.equal(payload.sessions[1].weekday, 3)
  const course = courseWritePayload({ code: 'CHEM-01', name: '化学', credit: '2' })
  assert.equal(course.courseCode, 'CHEM-01')
  assert.equal(course.credit, 2)
})

test('考勤补录使用异常枚举，公告范围按 scopeType', () => {
  assert.deepEqual(validateAttendanceRecord({ classId: 1, studentId: 2, date: '2026-11-03', exceptionType: 'LATE' }), [])
  const record = attendanceRecordPayload({
    studentId: 9,
    classId: 3,
    date: '2026-11-03',
    exceptionType: 'SICK_LEAVE',
    reason: '发烧'
  })
  assert.equal(record.exceptionType, 'SICK_LEAVE')
  assert.equal(record.confirmStatus, 'CONFIRMED')
  assert.equal(record.reasonDetail, '发烧')
  const note = announcementWritePayload({
    title: '停课',
    body: '明天停课',
    scopeType: 'CLASS',
    scopeIds: ['4'],
    pinned: true
  })
  assert.equal(note.scopeType, 'CLASS')
  assert.deepEqual(note.scopeIds, [4])
  assert.equal(note.isTop, 1)
  assert.deepEqual(validateAnnouncement({ title: '', body: 'x', scopeType: 'ALL' }), ['标题不能为空'])
})

test('年级和班级写请求带齐后端必填字段', () => {
  const grade = gradeWritePayload({ gradeCode: 'G1', gradeName: '高一', gradeType: 'SENIOR', gradeLevel: 1 })
  assert.equal(grade.gradeType, 'SENIOR')
  const schoolClass = classWritePayload({
    gradeId: 1,
    classCode: 'C13',
    className: '高一(3)班',
    classNumber: 3,
    capacity: 45,
    headTeacherId: ''
  })
  assert.equal(schoolClass.gradeId, 1)
  assert.equal(schoolClass.classNumber, 3)
  assert.equal('headTeacherId' in schoolClass, false)
})
