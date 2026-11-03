# 二期前端接口笔记

请求都走 Axios `baseURL`（开发环境 `VITE_API_BASE=http://localhost:8080/api/v1`）。业务失败展示接口 `message`；`网络不可用` 和 `服务暂不可用` 用 `load-hint`。

字段对齐 camp-app `cursor/phase1-api-alignment-3865` 的 VO，不在前端伪造保存成功。

## 已接上的写路径

| 页面 | 方法 | 说明 |
| --- | --- | --- |
| 学生 | `POST/PUT /students` | `classId` 优先。性别男 1 / 女 2。学籍 0 休学、1 在读、2 毕业、3 退学 |
| 用户 | `POST /users` | `username`、`realName`、`userType`、可选 `password`。管理员 3，教务/教师 2，学生 1 |
| 用户 | `PUT /users/{id}` | 不传 `password` |
| 用户 | `PUT /users/{id}/roles` | `{ roleCodes: ["ADMIN"\|"ACADEMIC"\|"TEACHER"\|"STUDENT"] }`。家长不是独立角色，沿用学生 |
| 用户 | `PUT /users/{id}/status?status=` | 1 启用，0 停用。不能停用当前登录账号 |
| 课程库 | `POST/PUT/DELETE /courses` | `courseCode`、`courseName` |
| 班级授课 | `POST/PUT/DELETE /class-courses` | 必填 `classId`、`courseId`，节次在 `sessions[]`。同一授课的多节会一起提交 |
| 周课表 / 我的课表 | `GET /class-courses/my-timetable` | 只读 |
| 考勤汇总 | `GET /attendances/summaries` | 只读。页面不调用 `POST /attendances/summaries` |
| 考勤异常 | `POST/PUT /attendances/records` | `exceptionType`：`LATE`、`EARLY_LEAVE`、`PERSONAL_LEAVE`、`SICK_LEAVE`、`ABSENT`；`confirmStatus` 默认 `CONFIRMED` |
| 公告 | `POST/PUT /announcements` | `scopeType` + `scopeIds`。全校是 `ALL` 且 `scopeIds` 为空 |
| 公告置顶 | `PUT /announcements/{id}/top?isTop=` | 按钮权限 `announcement:top`（管理员、教务） |
| 年级 | `POST/PUT/DELETE /grades` | `gradeCode`、`gradeName`、`gradeType`（`PRIMARY`/`JUNIOR`/`SENIOR`）、`gradeLevel` |
| 班级 | `POST/PUT/DELETE /classes` | `gradeId`、`classCode`、`className`、`classNumber`。教室字段后端没有，列表不再展示教室 |

新增用户如果创建成功但角色写入失败，表单会留下错误，不会把身份显示成已经设好。

## 联调时要注意

- 开发头 `X-Dev-Class-Ids` 里首期种子是 `c13` 这种非数字。后端只解析数字，教师的数据范围会是空的，对本班的公告、学生、排课可能 403。这是联调头的问题，前端仍按数字班级 id 提交。
- 用户列表会再请求每个用户的 `/users/{id}/roles`。角色接口失败时，学生/管理员按 `userType` 显示，教职工显示「教职工」，不猜成教务或教师。
- 旧文件 `src/api/user.js`、`grade.js`、`class.js` 仍指向 `/api/users` 这类旧路径，给未挂到侧栏的旧页使用。二期页面用 `src/api/users.js` 和 `src/api/org.js`。

## 还没做

考试、成绩、访客、报表、文件上传、短信和待办仍是计划里的 M3–M5 / 后端 N2–N5，本轮没有页面，也没有假接口。
