import { defineStore } from 'pinia'
import { createSeed, summarizeSession } from '../data/seed.js'
import { nid, todayISO, weekdayIndex } from '../utils/format.js'

function sortStudents(list) {
  return [...list].sort((a, b) => a.rank - b.rank || a.studentNo.localeCompare(b.studentNo))
}

export const useCampusStore = defineStore('campus', {
  state: () => createSeed(),
  getters: {
    teacherNames: (state) => {
      const names = new Set(state.schedules.map((item) => item.teacher).filter(Boolean))
      ;['王老师', '赵老师', '陈老师', '刘老师', '孙老师'].forEach((name) => names.add(name))
      return [...names]
    }
  },
  actions: {
    classesFor(user) {
      if (!user) return []
      if (user.role === 'ADMIN' || user.role === 'ACADEMIC') return this.classes
      if (user.role === 'TEACHER') {
        return this.classes.filter((item) => user.classNames?.includes(item.name))
      }
      return this.classes.filter((item) => item.name === user.className)
    },
    studentsFor(user) {
      const classes = new Set(this.classesFor(user).map((item) => item.name))
      if (user?.role === 'STUDENT') {
        const name = user.actor === 'PARENT' ? user.linkedStudentName : user.name
        return sortStudents(this.students.filter((item) => item.name === name || item.studentNo === user.studentNo))
      }
      return sortStudents(this.students.filter((item) => classes.has(item.className)))
    },
    schedulesFor(user) {
      if (!user) return []
      if (user.role === 'ADMIN' || user.role === 'ACADEMIC') return this.schedules
      if (user.role === 'TEACHER') return this.schedules.filter((item) => item.teacher === user.name)
      const className = user.className
      return this.schedules.filter((item) => item.className === className)
    },
    sessionsFor(user) {
      const classes = new Set(this.classesFor(user).map((item) => item.name))
      if (user?.role === 'STUDENT') {
        const self = this.studentsFor(user)[0]
        if (!self) return []
        return this.sessions.filter((session) => session.className === self.className)
      }
      return this.sessions.filter((session) => classes.has(session.className))
    },
    contactsFor(studentId) {
      return this.contacts.filter((item) => item.studentId === studentId)
    },
    missingContactCount(user) {
      const students = this.studentsFor(user)
      return students.filter((student) => !this.contacts.some((item) => item.studentId === student.id)).length
    },
    summary(session) {
      return summarizeSession(session, this.students)
    },
    pendingClassNames(user, date = todayISO()) {
      const recorded = new Set(
        this.sessions.filter((item) => item.date === date).map((item) => item.className)
      )
      return this.classesFor(user)
        .map((item) => item.name)
        .filter((name) => !recorded.has(name))
    },
    unreadAnnouncements(userId) {
      return this.announcements.filter((item) => !item.readBy.includes(userId))
    },
    todaySchedules(user, date = new Date()) {
      const weekday = weekdayIndex(date)
      return this.schedulesFor(user)
        .filter((item) => item.weekday === weekday)
        .sort((a, b) => a.periodStart - b.periodStart)
    },
    headcount(user) {
      return this.studentsFor(user).length
    },
    saveStudent(input) {
      const studentNo = input.studentNo.trim()
      const duplicated = this.students.some((item) => item.studentNo === studentNo && item.id !== input.id)
      if (duplicated) throw new Error('学号已存在')
      const cls = this.classes.find((item) => item.name === input.className)
      if (!cls) throw new Error('请选择班级')
      if (input.id) {
        const index = this.students.findIndex((item) => item.id === input.id)
        if (index < 0) throw new Error('学生不存在')
        this.students[index] = {
          ...this.students[index],
          name: input.name.trim(),
          gender: input.gender,
          status: input.status,
          phone: input.phone.trim(),
          className: cls.name,
          classId: cls.id,
          grade: cls.grade
        }
        return this.students[index]
      }
      const created = {
        id: studentNo,
        studentNo,
        name: input.name.trim(),
        gender: input.gender,
        status: input.status || '在读',
        phone: input.phone.trim(),
        grade: cls.grade,
        classId: cls.id,
        className: cls.name,
        rank: 100
      }
      this.students.push(created)
      return created
    },
    importStudents(rows, allowedClasses) {
      let success = 0
      const errors = []
      rows.forEach((row, index) => {
        try {
          const className = row['班级'] || row.className
          if (allowedClasses && !allowedClasses.includes(className)) {
            throw new Error('班级不在数据范围内')
          }
          this.saveStudent({
            studentNo: row['学号'] || row.studentNo || '',
            name: row['姓名'] || row.name || '',
            gender: row['性别'] || '男',
            className,
            phone: row['手机'] || '',
            status: row['学籍'] || '在读'
          })
          success += 1
        } catch (error) {
          errors.push(`第 ${index + 2} 行：${error.message}`)
        }
      })
      return { success, errors }
    },
    saveContact(input) {
      if (input.primary) {
        this.contacts.forEach((item) => {
          if (item.studentId === input.studentId) item.primary = false
        })
      }
      this.contacts.push({
        id: nid('ec'),
        studentId: input.studentId,
        name: input.name.trim(),
        relation: input.relation,
        phone: input.phone.trim(),
        primary: Boolean(input.primary)
      })
    },
    saveCourse(input) {
      const name = input.name.trim()
      if (!name) throw new Error('请填写课程名称')
      if (input.id) {
        const found = this.courses.find((item) => item.id === input.id)
        if (found) found.name = name
        this.schedules.forEach((item) => {
          if (item.courseId === input.id) item.name = name
        })
        return found
      }
      const created = { id: input.code?.trim() || nid('COURSE'), name }
      if (this.courses.some((item) => item.id === created.id)) throw new Error('课程编号已存在')
      this.courses.push(created)
      return created
    },
    saveSchedule(input) {
      const periodStart = Number(input.periodStart)
      const periodEnd = Number(input.periodEnd)
      if (!periodStart || !periodEnd) throw new Error('请填写开始节次和结束节次')
      if (periodEnd < periodStart) throw new Error('结束节次不能早于开始节次')
      if (periodStart < 1 || periodEnd > 8) throw new Error('节次范围为 1–8')
      const course = this.courses.find((item) => item.id === input.courseId)
      const payload = {
        courseId: input.courseId || null,
        name: course?.name || input.name?.trim() || '未命名课程',
        className: input.className,
        teacher: input.teacher.trim(),
        weekday: Number(input.weekday),
        periodStart,
        periodEnd,
        roomNo: input.roomNo.trim()
      }
      if (!payload.className || !payload.teacher || !payload.roomNo) throw new Error('请完整填写班级、教师和教室')
      if (input.id) {
        const index = this.schedules.findIndex((item) => item.id === input.id)
        if (index < 0) throw new Error('排课不存在')
        this.schedules[index] = { ...this.schedules[index], ...payload }
        return this.schedules[index]
      }
      const created = { id: nid('sch'), ...payload }
      this.schedules.push(created)
      return created
    },
    saveSession(input) {
      const marks = input.marks.filter((item) => item.status)
      const existing = this.sessions.findIndex(
        (item) => item.date === input.date && item.className === input.className && item.courseName === input.courseName
      )
      const record = {
        id: existing >= 0 ? this.sessions[existing].id : nid('ses'),
        date: input.date,
        className: input.className,
        courseId: input.courseId || null,
        courseName: input.courseName || '班级日报',
        marks
      }
      if (existing >= 0) this.sessions[existing] = record
      else this.sessions.unshift(record)
      return record
    },
    publishAnnouncement(input, userId) {
      const title = input.title.trim()
      const body = input.body.trim()
      if (!title || !body) throw new Error('请填写标题和正文')
      this.announcements.unshift({
        id: nid('a'),
        title,
        body,
        pinned: Boolean(input.pinned),
        scope: input.scope || '全校',
        author: input.author,
        publishedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        readBy: [userId]
      })
    },
    markRead(id, userId) {
      const found = this.announcements.find((item) => item.id === id)
      if (found && !found.readBy.includes(userId)) found.readBy.push(userId)
    },
    toggleTodo(id) {
      const todo = this.todos.find((item) => item.id === id)
      if (todo) todo.done = !todo.done
    },
    addGrade(name) {
      const value = name.trim()
      if (!value) throw new Error('请填写年级名称')
      if (this.grades.includes(value)) throw new Error('年级已存在')
      this.grades.push(value)
    },
    addClass(input) {
      const name = input.name.trim()
      if (!name || !input.grade) throw new Error('请填写年级和班级名称')
      if (this.classes.some((item) => item.name === name)) throw new Error('班级已存在')
      this.classes.push({
        id: nid('cls'),
        grade: input.grade,
        name,
        head: input.head.trim() || '待定',
        room: input.room.trim() || '—'
      })
    }
  }
})
