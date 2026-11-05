import assert from 'node:assert/strict'
import test from 'node:test'
import { loginIdentity } from '../src/domain/sessionIdentity.js'

test('教务 userType 为 2 时按 roles 显示教务，不标成教师', () => {
  const identity = loginIdentity({
    username: 'academic01',
    realName: '教务周宁',
    userType: 2,
    roles: ['ACADEMIC'],
    permissions: ['org:write', 'student:write', 'announcement:top']
  }, { portal: 'staff', identifier: 'academic01' })
  assert.equal(identity.role, 'ACADEMIC')
  assert.equal(identity.title, '教务')
  assert.equal(identity.permissions.includes('org:write'), true)
  assert.equal(identity.permissions.includes('student:write'), true)
})

test('教师写按钮补上种子里的 student:write 与 course:write，其它写权限仍隐藏', () => {
  const identity = loginIdentity({
    username: 'teacher01',
    realName: '班主任李想',
    userType: 2,
    roles: ['TEACHER'],
    permissions: ['announcement:publish', 'attendance:record', 'student:export']
  }, { portal: 'staff', identifier: 'teacher01' })
  assert.equal(identity.role, 'TEACHER')
  assert.equal(identity.title, '教师')
  for (const code of ['student:write', 'course:write', 'attendance:record', 'announcement:publish', 'student:export']) {
    assert.equal(identity.permissions.includes(code), true, code)
  }
  for (const code of ['student:import', 'announcement:top', 'org:write', 'user:write']) {
    assert.equal(identity.permissions.includes(code), false, code)
  }
})

test('没有 roles 时 userType 2 仍是教师，学生没有写权限', () => {
  const teacher = loginIdentity({ userType: 2, permissions: [] }, { portal: 'staff', identifier: 'newstaff' })
  assert.equal(teacher.role, 'TEACHER')
  assert.equal(teacher.permissions.includes('student:write'), true)
  const student = loginIdentity({
    userType: 1,
    roles: ['STUDENT'],
    permissions: []
  }, { portal: 'student', identifier: 'S20260001' })
  assert.equal(student.role, 'STUDENT')
  assert.equal(student.title, '学生')
  assert.deepEqual(student.permissions, [])
})

test('同时有多个角色时取最高档，GRADE_ADMIN 折叠为教务', () => {
  const both = loginIdentity({ roles: ['TEACHER', 'ACADEMIC'], userType: 2 })
  assert.equal(both.role, 'ACADEMIC')
  assert.equal(both.title, '教务')
  const folded = loginIdentity({ roles: ['GRADE_ADMIN'], userType: 2 })
  assert.equal(folded.role, 'ACADEMIC')
  assert.equal(folded.title, '教务')
})
