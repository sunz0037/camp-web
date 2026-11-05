const STAFF = ['ADMIN', 'ACADEMIC', 'TEACHER']
const REVIEW = ['ADMIN', 'ACADEMIC']

export function isStudent(user) {
  return user?.role === 'STUDENT'
}

/** 考试安排 / 成绩：ADMIN、ACADEMIC 可写；TEACHER 可写，范围由服务端数据权限裁剪。 */
export function canWriteExam(user) {
  return STAFF.includes(user?.role)
}

export function canWriteScore(user) {
  return STAFF.includes(user?.role)
}

/** 来访登记：教职工可建单；学生不开放该页。 */
export function canWriteVisitor(user) {
  return STAFF.includes(user?.role)
}

/** 批准、拒绝、入校、离校：仅 ADMIN / ACADEMIC。 */
export function canReviewVisitor(user) {
  return REVIEW.includes(user?.role)
}
