# 校园 OA 二期进度（camp-web）

分支：`cursor/phase2-campus-oa`（从 `cursor/phase1-campus-oa-096c` `5d4be73` 拉出）。不改 v1.3.3 / v1.3.4 的有意偏离：侧栏 200、列表无 `.page-head`、表 10×16、`--pager-pad` 12×16、导航 `#8B90A5` / `#5B6CF0` / 字重 400。

对照的后端是 camp-app `cursor/phase1-api-alignment-3865`（PR #3）上已经存在的 `/api/v1` 写接口。本仓库不改 camp-app。下面没有发现需要标 `PHASE2-BLOCKED` 的 M1 写路径。

## 里程碑

- [x] **M1 真表单闭环**
  - [x] 学生：预览区可编辑，提交 `POST/PUT /api/v1/students`，带 `classId`；手机号不合格时停在表单里
  - [x] 用户：新增 / 编辑 / 启停走 `/api/v1/users`；初始密码只出现在新增，编辑请求体不含 `password`；身份用 `PUT /users/{id}/roles`
  - [x] 课程库 `POST/PUT/DELETE /courses`，班级授课 `POST/PUT/DELETE /class-courses`（必须有班级和课程）；周课表读 `/class-courses/my-timetable`
  - [x] 考勤汇总只读。异常补录和修改走 `POST/PUT /attendances/records`（`LATE | EARLY_LEAVE | PERSONAL_LEAVE | SICK_LEAVE | ABSENT`）。汇总写接口存在，页面不调用
  - [x] 公告发布 / 编辑 / 置顶：`scopeType` 为 `ALL | GRADE | CLASS`，置顶走 `PUT /announcements/{id}/top`
  - [x] 列表失败仍用 `load-hint`（`#9AA0B8`）
- [x] **M2 组织与课表**
  - [x] 年级、班级用 Tab 深链：`/home/org-classes?tab=grades` 与 `?tab=classes&gradeId=`，写接口 `/api/v1/grades`、`/api/v1/classes`，需 `org:write`
  - [x] 我的课表继续读 `my-timetable`，空态用课表组件里的「本周没有课程」，没有页面大标题
- [ ] M3 权限壳
- [ ] M4 考试 / 访客 / 报表
- [ ] M5 体验收尾（README 大改仍留在这一项；本轮只补了本文件和 `docs/api-fe-notes.md`）

## 截图

本地按首期契约搭了一个内存接口，用管理员身份把「填写 → 保存 → 列表出现」走完。camp-app 不在本环境，所以这些图证明的是前端请求和刷新，不是连上真实 H2 的联调。

| 页面 | 图 |
| --- | --- |
| 学生保存后回到列表 | [students-saved.png](phase2-shots/students-saved.png) |
| 用户新增后身份为教师 | [users-saved.png](phase2-shots/users-saved.png) |
| 排课写入后的周课表 | [courses-saved.png](phase2-shots/courses-saved.png) |
| 异常补录 | [attendance-makeup.png](phase2-shots/attendance-makeup.png) |
| 公告发布并置顶 | [announcements-pinned.png](phase2-shots/announcements-pinned.png) |
| 年级 / 班级深链 | [org-classes.png](phase2-shots/org-classes.png) |
| 我的课表无大标题 | [my-schedule.png](phase2-shots/my-schedule.png) |

同一轮还改了一名学生的姓名、一名用户的姓名、一条公告标题，保存后列表跟着变。非法手机号停在学生表单，没有发出创建请求。

## 验证

- `node --test tests/writePayloads.test.js`
- `npm run build`
- 无头浏览器走通上面的保存路径。页面请求里除 `favicon.ico` 外没有 404。
