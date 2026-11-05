# W5 冒烟记录

日期：2026-11-05。口径：[`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md)（PR #5 squash 合入 `b1304de`）。前端 `main` 尖端含个人中心对齐 `13e25f2`。本次只记录，不改壳层 token，也不改业务代码。

功能过线四项没有同时满足。壳层锁、个人中心表单壳、学生写路径、公告写路径通过。教务身份、教师在学生/课程上的写按钮、用户角色收口、考试与成绩接口、来访新增未通过。

## 环境

| 项 | 值 |
| --- | --- |
| camp-web | `main` `b1304de`，其父提交 `13e25f2` |
| camp-app | `main` `8dd0504`（PR #7），`./gradlew bootRun --args='--spring.profiles.active=h2'`，端口 8080 |
| 前端 | `VITE_API_PROFILE=dev npm run build`，`vite preview` 于 `http://127.0.0.1:4173` |
| 账号 | 密码 `Demo@123456`。`admin` / `academic01` / `teacher01` 走教职工入口。学生文档账号见下 |

camp-app 在本机用 H2 起来了，冒烟打的是这套 dev 登录，不是离线种子回退。

## 可跑项 / 阻塞项

可跑：四角色进入工作台（学生要用学号）、侧栏与写按钮清点、壳层实测、学生与公告的保存并刷新、填写学分后的课程保存、来访列表。

阻塞：

- **PHASE2-BLOCKED** `GET/POST /api/v1/exams`。考试安排页因此显示「服务暂不可用」。camp-app 上有数据的是 `/api/v1/exam-schedules`（200，1 条演示），页面不调用这条。
- **PHASE2-BLOCKED** `GET/POST /api/v1/exam-scores`。考试成绩页同样显示「服务暂不可用」。camp-app 有 `/api/v1/scores`（200），页面不调用这条。
- 文件域页面没有入口。`POST /api/v1/files/upload` 在（空请求 415）。接口还在，只是页面没接，不标 PHASE2-BLOCKED。
- 角色权限、数据查询权限、教师班级关联、年级管理员关联：页面用空的 `VITE_API_BASE_URL` 去请求预览站自身的 `/api/roles`、`/api/data-permissions`、`/api/teachers/{id}/classes`、`/api/grade-admins/{id}/grades`，得到 404，列表是占位行。同一数据在 `/api/v1/...` 上返回 200。这是前端旧客户端没走 `VITE_API_BASE`，不标 PHASE2-BLOCKED。

## 壳层锁

在学生列表页读计算样式，班级授课科目页复核表与分页脚。全部命中锁定值。遍历 18 个路由，`.page-head` 与 `.page-header` 数量都是 0。

| 项 | 锁定值 | 实测 |
| --- | --- | --- |
| 侧栏 | 200 | `--sidebar-width: 200px`，`.sidebar` 宽 200px |
| 列表 | 无 `.page-head` | 四角色全部走过的页面均为 0 |
| 表 | 10×16 | `table.data` 的 `th` / `td`：`padding: 10px 16px` |
| 分页脚 | 12×16 | `--pager-pad: 12px 16px`，`.table-foot` 的 padding 同值 |
| 导航 | `#8B90A5` / `#5B6CF0` / 字重 400 | 未选中 `rgb(139, 144, 165)`，选中 `rgb(91, 108, 240)`，字重 400 |

截图：[shell-students.png](w5-shots/shell-students.png)

## 个人中心与 /users

个人中心与用户列表的预览卡同壳：标题「表单预览」，宽 1160px，内边距 24px，圆角 20px，三列网格，页面左右内边距 40px。个人中心是可编辑输入；用户列表未点编辑时是同网格的只读字段。改密页预览卡同宽。四角色页面正文里没有「暗色 / 校园绿 / 换肤」，`html` 没有 `data-theme`。

真实登录的 `userInfo` 不带手机和邮箱，管理员个人中心这两格是空的。保存只写本地 `localStorage`，这次点击之后没有新的接口请求。

截图：[shell-profile.png](w5-shots/shell-profile.png)、[shell-users.png](w5-shots/shell-users.png)、[shell-password.png](w5-shots/shell-password.png)

## 登录与侧栏

| 角色 | 入口 | 结果 |
| --- | --- | --- |
| ADMIN | `admin` | 通过。身份「管理员」，侧栏 17 项与 `nav.js` 一致 |
| ACADEMIC | `academic01` | 失败。接口 `roles` 为 `ACADEMIC`、`userType` 为 2。登录只读 `userInfo.role`，没有就按 `userType` 2 记成教师。顶栏是「教务周宁 / 教师」，侧栏少「年级管理员关联」。权限数组仍是教务那一套，所以学生、课程、公告置顶、组织写按钮还在 |
| TEACHER | `teacher01` | 侧栏通过。写按钮见矩阵：学生和课程没有「新增」，因为登录用了后端权限（`announcement:publish`、`attendance:record`、`student:export`）。本仓库 `ROLE_PERMISSIONS.TEACHER` 还包含 `student:write` 与 `course:write` |
| STUDENT | 文档账号 `student01` | 失败。学生入口按学号查找，返回「账号或密码错误」。种子学号是 `S20260001`，用户名才是 `student01` |
| STUDENT | 学号 `S20260001` | 通过。身份「学生」，侧栏为首页、我的课表、我的考勤、公告、考试安排、考试成绩、个人中心、修改密码 |

截图：[sidebar-admin.png](w5-shots/sidebar-admin.png)、[sidebar-academic.png](w5-shots/sidebar-academic.png)、[sidebar-teacher.png](w5-shots/sidebar-teacher.png)、[sidebar-student.png](w5-shots/sidebar-student.png)、[login-student01-fail.png](w5-shots/login-student01-fail.png)

## 角色 × 页面

「拒绝」表示打开后是「无法访问」，菜单里也没有入口。「菜单外可开」表示侧栏不放、路由 `roles` 仍包含该身份，地址能进。

| 页面 | ADMIN | ACADEMIC | TEACHER | STUDENT |
| --- | --- | --- | --- | --- |
| 首页概览 | 通过 | 通过（顶栏身份为教师） | 通过 | 通过 |
| 学生信息 | 通过，有导入与新增 | 通过，有导入与新增 | 失败，只有导出 | 拒绝 |
| 课程与排课 | 通过，有新增 | 通过，有新增 | 失败，无新增 | 拒绝 |
| 我的课表 | 菜单外可开 | 菜单外可开 | 菜单外可开 | 通过 |
| 考勤管理 | 通过，异常明细有补录 | 通过 | 通过 | 通过，面包屑「我的考勤」，无补录 |
| 校园公告 | 通过，发布与置顶 | 通过，发布与置顶 | 通过，有发布、无置顶 | 通过，无发布 |
| 考试安排 | PHASE2-BLOCKED | PHASE2-BLOCKED | PHASE2-BLOCKED | PHASE2-BLOCKED |
| 考试成绩 | PHASE2-BLOCKED | PHASE2-BLOCKED | PHASE2-BLOCKED | PHASE2-BLOCKED |
| 来访登记 | 列表通过；新增失败 | 有登记 | 有登记 | 拒绝 |
| 年级班级 | 通过。默认班级页按钮是「新增班级」 | 通过（组织写权限还在） | 通过，无写按钮 | 拒绝 |
| 用户账号 | 通过。创建见写路径 | 拒绝（该页只给管理员） | 拒绝 | 拒绝 |
| 班级授课科目 | 通过，列表打开且无加载错误 | 通过 | 通过 | 拒绝 |
| 教师班级关联 | 失败，占位行 | 失败，占位行 | 失败，占位行 | 拒绝 |
| 年级管理员关联 | 失败，占位行 | 失败。应可进，实际无法访问 | 拒绝 | 拒绝 |
| 角色权限管理 | 失败，占位行 | 拒绝 | 拒绝 | 拒绝 |
| 数据查询权限 | 失败，占位行 | 拒绝 | 拒绝 | 拒绝 |
| 个人中心 | 通过，无主题 UI | 通过 | 通过 | 通过 |
| 修改密码 | 通过。只打开，未提交 | 通过 | 通过 | 通过 |

年级页的「新增年级」与班级页的「新增班级」共用 `org:write`。管理员和被标成教师的教务账号在默认班级页看到的是「新增班级」。

## 写路径

管理员执行。成功标准是保存后列表里能看到新行。

| 路径 | 结果 | 证据 |
| --- | --- | --- |
| 学生 | 通过。`S9916085` / 验收生916085 出现在列表，状态在读，提示「学生信息已保存」 | [write-students.png](w5-shots/write-students.png) |
| 用户 | 未收口。`w5916085` 已在列表且身份显示教师；`PUT /api/v1/users/7/roles` 返回业务码 409「数据冲突或仍被引用，无法保存」，编辑态没关上 | [write-users.png](w5-shots/write-users.png) |
| 课程 | 空学分失败，页面提示「学分不能为空」，前端未把学分标成必填。补学分 `1` 后通过：`W5B033991` / 验收课B033991，提示「课程已保存」，接口列表能查到 | [write-courses.png](w5-shots/write-courses.png)、[write-courses-credit.png](w5-shots/write-courses-credit.png) |
| 公告 | 通过。验收公告916085 出现在列表顶部，范围全校，提示「公告已发布」 | [write-announcements.png](w5-shots/write-announcements.png) |

## 考试 / 访客 / 文件

访客列表可以演示：种子「陈家长」「张来访」，分页「共 2 条来访」，批准 / 拒绝 / 入校按钮在。新增提交后接口业务错误「事由不能为空」。页面把事由放在 `reason`、被访人放在 `hostName`；后端创建要 `purpose`，并且被访人要 `hostUserId`。列表这一域算演示过，新增写路径未过。

考试安排与考试成绩两页都是 PHASE2-BLOCKED，见上。文件页没有入口。

截图：[domain-visitors.png](w5-shots/domain-visitors.png)、[domain-visitor-write.png](w5-shots/domain-visitor-write.png)、[domain-exams.png](w5-shots/domain-exams.png)、[domain-scores.png](w5-shots/domain-scores.png)

## 签字

需求在下表签字后，本次冒烟才算收口。当前待签。

| 角色 | 结论 | 日期 |
| --- | --- | --- |
| 需求 | 待签 | |
