# 前端功能清单与完成情况

**核对日期**：2026-10-21  
**范围**：`camp-web` 当前工作区源码（路由、侧边栏、页面、`src/api`）  
**说明**：本次只核对前端是否把主流程接到接口。后端仓库不在当前工作区，后端是否可用未重新核对。

`MENU_API_STATUS.md` 原先写于 2024-12，当时把 17 个菜单标成占位页。那些页面后来已经做成独立管理页，下面以当前代码为准。

## 完成度

侧边栏共 **21** 项：

| 状态 | 数量 | 功能 |
|------|------|------|
| 已完成 | 15 | 学生信息、应急联系人、考勤、科目、考试安排、班级授课科目、班级、角色权限、数据查询权限、教师班级关联、年级管理员关联、校园公告、来访登记、个人信息、修改密码 |
| 部分完成 | 4 | 首页概览、考试成绩、年级管理、用户管理 |
| 未开发 | 2 | 批量导入导出、统计报表 |

主流程完成率：15 / 21（约 71%）。

## 菜单清单

### 首页

| 功能 | 路由 | 页面 | 状态 | 说明 |
|------|------|------|------|------|
| 首页概览 | `/home/` | `HomeDashboard.vue` | 部分完成 | 月历可切换。学生总数、课程数、公告数、待办为写死数据。天气在 `src/api/weather.js` 使用本地模拟数据 |

顶栏搜索框和通知铃铛在 `HomePage.vue` 中没有绑定查询或消息列表。

### 学生管理

| 功能 | 路由 | 页面 | 状态 | 已接接口 |
|------|------|------|------|----------|
| 学生信息管理 | `/home/students` | `StudentManagementPage.vue` | 已完成 | `src/api/student.js`：列表、详情、创建、更新、删除 |
| 应急联系人管理 | `/home/emergency-contacts` | `EmergencyContactManagementPage.vue` | 已完成 | `src/api/emergencyContact.js`：增删改查、设主要联系人 |
| 考勤管理 | `/home/attendance` | `AttendanceManagementPage.vue` | 已完成 | `src/api/attendance.js`：班级每日汇总、学生异常记录 |

学生页没有批量导入导出，该能力单独放在「批量导入导出」菜单，目前仍是占位页。

### 教学教务

| 功能 | 路由 | 页面 | 状态 | 说明 |
|------|------|------|------|------|
| 科目管理 | `/home/courses` | `CourseManagementPage.vue` | 已完成 | `src/api/course.js` 增删改查 |
| 考试安排管理 | `/home/exam-schedules` | `ExamScheduleManagementPage.vue` | 已完成 | 增删改查，并可取消考试 |
| 考试成绩管理 | `/home/scores` | `ScoreManagementPage.vue` | 部分完成 | 单条成绩增删改查已接 `src/api/score.js`。批量录入、学生成绩统计、导出未做 |
| 班级授课科目 | `/home/class-courses` | `ClassCourseManagementPage.vue` | 已完成 | 按班级维护，支持批量添加。`batchDeleteClassCourses` 未接到页面 |

### 组织与权限

| 功能 | 路由 | 页面 | 状态 | 说明 |
|------|------|------|------|------|
| 年级管理 | `/home/grades` | `GradeManagementPage.vue` | 部分完成 | 可查询、启停、编辑描述。页面没有独立新增、删除入口，分页已关闭 |
| 班级管理 | `/home/classes` | `ClassManagementPage.vue` | 已完成 | `src/api/class.js` 增删改查 |
| 用户管理 | `/home/users` | `UserManagementPage.vue` | 部分完成 | 增删改、启用/禁用已接 `src/api/user.js`。此页不能给用户分配角色 |
| 角色权限管理 | `/home/roles` | `RoleManagementPage.vue` | 已完成 | 角色增删改查，权限树分配权限 |
| 数据查询权限 | `/home/data-permissions` | `DataPermissionManagementPage.vue` | 已完成 | `src/api/dataPermission.js` 增删改查 |
| 教师班级关联 | `/home/teacher-classes` | `TeacherClassManagementPage.vue` | 已完成 | 按教师查询、新增、删除 |
| 年级管理员关联 | `/home/grade-admin-grades` | `GradeAdminGradeManagementPage.vue` | 已完成 | 按管理员查询、新增、删除 |

### 校园事务

| 功能 | 路由 | 页面 | 状态 | 说明 |
|------|------|------|------|------|
| 校园公告管理 | `/home/announcements` | `AnnouncementManagementPage.vue` | 已完成 | 发布、编辑、置顶、撤回、删除 |
| 来访登记管理 | `/home/visitors` | `VisitorManagementPage.vue` | 已完成 | 登记、审核、拒绝、登记进入与离开 |

### 数据

| 功能 | 路由 | 页面 | 状态 | 说明 |
|------|------|------|------|------|
| 批量导入导出 | `/home/batch-operations` | `PlaceholderPage.vue` | 未开发 | 页面文案为「功能开发中」 |
| 统计报表 | `/home/statistics` | `PlaceholderPage.vue` | 未开发 | 页面文案为「功能开发中」 |

### 个人中心

| 功能 | 路由 | 页面 | 状态 | 说明 |
|------|------|------|------|------|
| 个人信息 | `/home/profile` | `ProfilePage.vue` | 已完成 | `GET /api/auth/me`，可更新姓名和头像地址 |
| 修改密码 | `/home/change-password` | `ChangePasswordPage.vue` | 已完成 | `PUT /api/auth/password` |

## 账号能力（不计入侧边栏 21 项）

| 功能 | 入口 | 状态 | 说明 |
|------|------|------|------|
| 学生 / 教工密码登录 | `/login` | 已完成 | `POST /api/auth/login` |
| 首次登录激活 | `/login` | 已完成 | 校验姓名后设置密码 |
| 密码重置 | `/reset-password` | 已完成 | 学生凭身份证和应急联系人，教工凭验证码 |
| 人脸识别登录 | `/login` | 部分完成 | 能打开摄像头并检测人脸。`LoginPage.vue` 中仍标注未调用后端比对 |
| 家长 / 访客登录 | `/login` | 未开发 | 按钮保留，文案为暂未开放 |
| 退出登录 | 顶栏 | 部分完成 | 只清除本地 token，未调用 `POST /api/auth/logout` |

## 未提交改动中的调试开关

`src/config/api.js` 里 `SKIP_LOGIN_FOR_DEV = true`（尚未提交）。为 true 时，打开登录页会直接进入首页，并写入测试用 token。上线前应改为 `false`。

## 建议继续做的顺序

1. 批量导入导出、统计报表（目前只有占位页）
2. 成绩的批量录入与导出
3. 首页统计、待办、天气改为真实数据
4. 年级的新增与删除、用户分配角色
5. 人脸登录接到身份比对接口；家长 / 访客入口按产品决定是否开放
