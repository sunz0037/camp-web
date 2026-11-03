import { todayISO } from '../utils/format.js'

const CLASS_DEFS = [
  { id: 'c12', grade: '高一', name: '高一(2)班', head: '王老师', room: 'A201', count: 44 },
  { id: 'c13', grade: '高一', name: '高一(3)班', head: '王老师', room: 'A301', count: 42 },
  { id: 'c21', grade: '高二', name: '高二(1)班', head: '王老师', room: 'B201', count: 42 },
  { id: 'c11', grade: '高一', name: '高一(1)班', head: '赵老师', room: 'A101', count: 40 },
  { id: 'c22', grade: '高二', name: '高二(2)班', head: '陈老师', room: 'B202', count: 38 },
  { id: 'c31', grade: '高三', name: '高三(1)班', head: '刘老师', room: 'C101', count: 36 }
]

const YEAR_BY_GRADE = { 高一: '2024', 高二: '2023', 高三: '2022' }

const FEATURED = [
  { name: '李明', gender: '男', status: '在读', phone: '13812345678', className: '高一(3)班', studentNo: '20240101', rank: 0 },
  { name: '王芳', gender: '女', status: '在读', phone: '13912341234', className: '高一(3)班', studentNo: '20240115', rank: 1 },
  { name: '陈浩', gender: '男', status: '休学', phone: '13700001234', className: '高二(1)班', studentNo: '20230802', rank: 2 },
  { name: '赵雪', gender: '女', status: '在读', phone: '15812345678', className: '高一(2)班', studentNo: '20240208', rank: 3 },
  { name: '刘强', gender: '男', status: '在读', phone: '13600009988', className: '高二(1)班', studentNo: '20230911', rank: 4 }
]

const SURNAMES = '李王陈赵刘张周吴徐孙马朱胡郭何林高郑梁谢宋唐许邓冯韩曹彭曾'.split('')
const GIVEN = ['明', '芳', '浩', '雪', '强', '婷', '博', '欣', '宇', '琳', '杰', '娜', '晨', '悦', '凯', '怡', '航', '彤', '睿', '涵']
const FEATURED_NAMES = new Set(FEATURED.map((item) => item.name))

function buildStudents() {
  const used = new Set(FEATURED.map((item) => item.studentNo))
  const students = []
  let seq = 1

  const nextNo = (year) => {
    let cursor = 1
    let value = `${year}${String(cursor).padStart(4, '0')}`
    while (used.has(value)) {
      cursor += 1
      value = `${year}${String(cursor).padStart(4, '0')}`
    }
    used.add(value)
    return value
  }

  const randomName = (index) => {
    let guard = 0
    let name = ''
    do {
      name = `${SURNAMES[(index + guard) % SURNAMES.length]}${GIVEN[(index * 3 + guard) % GIVEN.length]}`
      guard += 1
    } while (FEATURED_NAMES.has(name) && guard < 12)
    return name
  }

  CLASS_DEFS.forEach((cls) => {
    const featured = FEATURED.filter((item) => item.className === cls.name)
    for (let index = 0; index < cls.count; index += 1) {
      const preset = featured[index]
      const year = YEAR_BY_GRADE[cls.grade]
      const studentNo = preset?.studentNo || nextNo(year)
      if (preset) used.add(studentNo)
      const phoneTail = String(10000000 + seq * 17).slice(0, 8)
      students.push({
        id: studentNo,
        studentNo,
        name: preset?.name || randomName(seq),
        gender: preset?.gender || (seq % 2 === 0 ? '女' : '男'),
        status: preset?.status || '在读',
        phone: preset?.phone || `138${phoneTail}`,
        grade: cls.grade,
        classId: cls.id,
        className: cls.name,
        rank: preset?.rank ?? 100
      })
      seq += 1
    }
  })

  return students
}

function buildContacts(students) {
  const contacts = []
  const liming = students.find((item) => item.name === '李明')
  if (liming) {
    contacts.push(
      { id: 'ec-1', studentId: liming.id, name: '李建国', relation: '父亲', phone: '13800001024', primary: true },
      { id: 'ec-2', studentId: liming.id, name: '王丽', relation: '母亲', phone: '13900002222', primary: false }
    )
  }
  students.forEach((student, index) => {
    if (student.name === '李明' || student.name === '陈浩' || student.name === '刘强') return
    if (index % 17 === 0) return
    contacts.push({
      id: `ec-${student.id}`,
      studentId: student.id,
      name: `${student.name.slice(0, 1)}家长`,
      relation: student.gender === '女' ? '母亲' : '父亲',
      phone: `137${String(20000000 + index).slice(0, 8)}`,
      primary: true
    })
  })
  return contacts
}

function makeSession(students, spec) {
  const roster = students.filter((item) => item.className === spec.className && item.status === '在读')
  const leave = spec.leave || 0
  const late = spec.late || 0
  const absent = spec.absent || 0
  const marks = roster.map((student, index) => {
    let status = 'present'
    if (index >= roster.length - absent) status = 'absent'
    else if (index >= roster.length - absent - late) status = 'late'
    else if (index >= roster.length - absent - late - leave) status = 'leave'
    return { studentId: student.id, status }
  })
  return {
    id: `ses-${spec.className}-${spec.date}`,
    date: spec.date,
    className: spec.className,
    courseId: spec.courseId,
    courseName: spec.courseName,
    marks
  }
}

export function createSeed() {
  const students = buildStudents()
  const date = todayISO()
  return {
    grades: ['高一', '高二', '高三'],
    classes: CLASS_DEFS.map(({ count, ...item }) => item),
    students,
    contacts: buildContacts(students),
    courses: [
      { id: 'MATH-01', name: '高等数学' },
      { id: 'MATH-02', name: '线性代数' },
      { id: 'ENG-01', name: '大学英语' },
      { id: 'PHY-01', name: '物理' },
      { id: 'CHN-01', name: '语文' },
      { id: 'HIS-01', name: '历史' }
    ],
    schedules: [
      { id: 'sch-1', courseId: 'MATH-01', name: '高等数学', className: '高一(3)班', teacher: '王老师', weekday: 2, periodStart: 1, periodEnd: 2, roomNo: 'A301' },
      { id: 'sch-2', courseId: 'MATH-02', name: '线性代数', className: '高一(3)班', teacher: '王老师', weekday: 2, periodStart: 3, periodEnd: 4, roomNo: 'B102' },
      { id: 'sch-3', courseId: 'ENG-01', name: '大学英语', className: '高一(3)班', teacher: '王老师', weekday: 2, periodStart: 5, periodEnd: 6, roomNo: 'C210' },
      { id: 'sch-4', courseId: 'PHY-01', name: '物理', className: '高一(2)班', teacher: '王老师', weekday: 1, periodStart: 1, periodEnd: 2, roomNo: 'D105' },
      { id: 'sch-5', courseId: 'CHN-01', name: '语文', className: '高一(2)班', teacher: '王老师', weekday: 3, periodStart: 1, periodEnd: 2, roomNo: 'A201' },
      { id: 'sch-6', courseId: 'HIS-01', name: '历史', className: '高二(1)班', teacher: '王老师', weekday: 4, periodStart: 5, periodEnd: 6, roomNo: 'B201' },
      { id: 'sch-7', courseId: 'PHY-01', name: '物理', className: '高一(3)班', teacher: '赵老师', weekday: 4, periodStart: 3, periodEnd: 4, roomNo: 'D105' },
      { id: 'sch-8', courseId: null, name: '班会', className: '高一(3)班', teacher: '王老师', weekday: 5, periodStart: 7, periodEnd: 8, roomNo: 'A301' },
      { id: 'sch-9', courseId: 'ENG-01', name: '大学英语', className: '高一(1)班', teacher: '孙老师', weekday: 1, periodStart: 3, periodEnd: 4, roomNo: 'C110' },
      { id: 'sch-10', courseId: 'CHN-01', name: '语文', className: '高二(2)班', teacher: '陈老师', weekday: 2, periodStart: 1, periodEnd: 2, roomNo: 'B202' },
      { id: 'sch-11', courseId: 'MATH-01', name: '高等数学', className: '高三(1)班', teacher: '刘老师', weekday: 3, periodStart: 5, periodEnd: 6, roomNo: 'C101' }
    ],
    sessions: [
      makeSession(students, {
        date,
        className: '高一(3)班',
        courseId: 'MATH-01',
        courseName: '高等数学',
        leave: 1,
        late: 1,
        absent: 1
      }),
      makeSession(students, {
        date,
        className: '高一(2)班',
        courseId: null,
        courseName: '早读点名',
        leave: 0,
        late: 0,
        absent: 0
      })
    ],
    announcements: [
      {
        id: 'a1',
        title: '下周期中考试安排已发布',
        body: '高一年级下周期中考试安排已经发布。请班主任在本周五前告知学生考场、时间与携带物品。',
        pinned: true,
        scope: '全校',
        author: '教务处',
        publishedAt: '2026-11-03 08:10',
        readBy: []
      },
      {
        id: 'a2',
        title: '关于晚自习调整的通知',
        body: '本周三起晚自习开始时间调整为 18:40，请所辖班级同步学生与家长。',
        pinned: false,
        scope: '高一',
        author: '教务处',
        publishedAt: '2026-11-02 16:20',
        readBy: ['t-wang', 'u-academic', 'u-admin']
      },
      {
        id: 'a3',
        title: '校园流感防护提醒',
        body: '换季期间请注意教室通风。出现发热请及时请假，不要带病上课。',
        pinned: false,
        scope: '全校',
        author: '校医室',
        publishedAt: '2026-11-01 09:00',
        readBy: ['t-wang', 'u-academic', 'u-admin']
      },
      {
        id: 'a4',
        title: '实验室开放时间调整',
        body: '物理实验室工作日开放时间改为 16:10–17:40，进入需任课教师陪同。',
        pinned: false,
        scope: '全校',
        author: '教务处',
        publishedAt: '2026-10-28 11:00',
        readBy: []
      },
      {
        id: 'a5',
        title: '校服征订说明',
        body: '秋季校服补订于本周五截止。请班主任核对尺码后统一提交。',
        pinned: false,
        scope: '全校',
        author: '总务处',
        publishedAt: '2026-10-25 15:00',
        readBy: []
      }
    ],
    todos: [
      { id: 'td-1', text: '登记高二(1)班考勤', done: false, to: '/home/attendance' },
      { id: 'td-2', text: '发布本班周测提醒', done: false, to: '/home/announcements' },
      { id: 'td-3', text: '核对应急联系人缺失', done: false, to: '/home/students' }
    ]
  }
}

export function summarizeSession(session, students) {
  const roster = students.filter((item) => item.className === session.className && item.status === '在读')
  const byId = Object.fromEntries(session.marks.map((mark) => [mark.studentId, mark.status]))
  const summary = { expected: roster.length, present: 0, leave: 0, late: 0, absent: 0 }
  roster.forEach((student) => {
    const status = byId[student.id] || 'present'
    if (summary[status] !== undefined) summary[status] += 1
  })
  summary.actual = summary.present
  summary.leaveOrLate = summary.leave + summary.late
  return summary
}
