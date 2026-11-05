# W4 Framer 体验对稿

对照日期：2026-11-05。本轮只对稿和标注，不改壳层 token，不实现后置项。

- Framer：[校园OA 重设计](https://framer.com/projects/zanqPCAZWIynxQtljR9c)（项目 main，Desktop 1440）
- camp-web `main` `13e25f2`（个人中心与改密收进列表「表单预览」壳；壳层 v1.3.4）
- 浏览器实测：本地 Vite，管理员 `admin` 走网络失败后的本地账号。列表接口未连 camp-app，表是空的；尺寸来自计算样式，不依赖行数据。

## 壳层六项

`/users` 是 Framer 列表母版。main 的令牌和计算样式与它对得上，本轮不回改。

| 项 | Framer `/users` | main `13e25f2` |
| --- | --- | --- |
| 侧栏 | Sidebar `200px`，内边距 `16px 12px`，项高 36、左右 10 | `--sidebar-width: 200px`；实测侧栏宽 200、内边距 `16px 12px` |
| 无 `.page-head` | 无 22/24px 页标题。面包屑是 12px「校园OA / 用户管理」 | 已挂路由的列表、个人中心、改密都没有 `.page-head`。首页问候用 `.dash-head`，不是列表大标题 |
| 表 10×16 | Table Head / Row `10px 16px` | `table.data th/td` 实测 `padding: 10px 16px` |
| pager 12×16 | Pagination `12px 16px` | `--pager-pad: 12px 16px`。学生页 `.table-foot` 实测 `12px 16px` |
| 导航色与字重 | 默认 `rgb(139, 144, 165)` = `#8B90A5`，选中 `rgb(91, 108, 240)` = `#5B6CF0`，字重都是 400，字号 14 | `--nav-fg` / `--nav-fg-active` / `--nav-weight: 400`。实测默认 `rgb(139, 144, 165)`，选中 `rgb(91, 108, 240)`，字重 400，字号 14 |
| 个人中心表单预览壳 | `/profile`、`/change-password` **还不是**这套壳，见下一节 | `/home/profile`、`/home/change-password` 与列表相同：卡片标题「表单预览」16px / 700，无页面大标题 |

选中项底色在 `/users` 上是 `rgba(91, 108, 240, 0.10)`，与 main `--c-brand-soft` 一致。

## 页面差异

### 已与 `/users` 母版同壳

这些 Framer 页：侧栏 200、无 22/24px 页标题、表头/行 `10px 16px`、分页 `12px 16px`、导航 14px / 400 / `#8B90A5`·`#5B6CF0`。多数带「表单预览」卡（内边距 24、标题 16px / 700）。

`/users`、`/roles`、`/classes`、`/grades`、`/class-courses`、`/teacher-classes`、`/grade-admin-grades`、`/exam-schedules`、`/scores`、`/visitors`、`/emergency-contacts`、`/data-permissions`。

`/grades` 有表和分页，没有表单预览卡。

main 上同一套壳已经铺到已挂路由的列表。用户页模板目前没有 `.table-foot`，Framer `/users` 有上一页 / 下一页。学生、考试、来访等页有分页脚，且使用 `--pager-pad`。这是页面缺口，本轮不补。

### 仍带页标题的首期帧

Framer `/students`、`/courses`、`/attendance`、`/announcements`、`/dashboard` 是另一套帧：侧栏仍是 200，导航字色仍是 `#8B90A5` / `#5B6CF0`、字重 400，但字号是 13。内容区有 22px / 700 标题（「校园OA / 学生信息」或「下午好，王老师」）。侧栏是 8 项短菜单（首页概览、学生信息、课程与排课、考勤管理、校园公告、年级班级、用户账号、个人中心），选中底和状态胶囊在截图里偏青绿，和 `/users` 靛蓝母版不是同一帧。

main 列表没有这行 22px 标题。首页保留问候，实测 h1 24px（`.dash-head h1`），比 Framer 问候大 2px。侧栏是当前 `PHASE_ROUTES`，不是这 8 项。这些标题不恢复。

### 个人中心与改密

Framer `/profile`、`/change-password` 停在旧壳：

- 侧栏 **264px**，内边距 `24px 16px`，菜单项 `9px 12px`
- 页标题 **24px / 700**（「个人信息」「修改密码」）
- 个人中心是 320px 头像卡 + 「基本信息」卡（用户名、真实姓名、用户类型、头像 URL、「编辑信息」）
- 改密是宽 520 的独立卡片，不是「表单预览」

main（`13e25f2`）有意改成列表同款预览壳，并继续用 200 侧栏：

- 无 `.page-head`
- 卡片标题「表单预览」
- 个人中心字段：姓名、身份、账号、手机、邮箱、密码（链到改密）
- 改密字段：当前密码、新密码、确认新密码，卡片与列表预览同宽

这是相对 Framer 旧帧的有意偏离。不把侧栏改回 264，不恢复 24px 页标题。

### 信息架构

| Framer | main |
| --- | --- |
| `/grades`、`/classes` 各一页，侧栏两项 | `/home/org-classes` 一个入口，页内 Tab。侧栏文案「年级班级」加注「合并」 |
| `/statistics`、`/batch-operations` 占位（「功能开发中，敬请期待…」） | 无这两条路由 |
| `/emergency-contacts` 全列表 | `PHASE_ROUTES` 未挂应急联系人 |
| `/reset-password` 含「教工密码重置（手机验证码）」和「发送验证码」 | 登录「忘记密码」只说明联系教务，不发验证码 |
| 全站无换肤控件 | `themes.css` 与 `theme` store 在，页面不渲染暗色 / 校园绿切换。`data-theme` 实测为空 |

`src/views/GradeManagementPage.vue`、`ClassManagementPage.vue`、`EmergencyContactManagementPage.vue` 里还有旧的 `.page-header`，路由器没有挂它们。线上壳层以 `oa.css` 为准。

## PHASE2-BLOCKED

下面三项只标注，本轮不实现，也不为此改 token。

| 项 | Framer | main | 标注 |
| --- | --- | --- | --- |
| 主题换肤 UI | 无换肤控件 | 接口与 `themes.css` 留着，页面不展示切换 | `src/api/settings.js`、`src/stores/theme.js` 已有 `PHASE2-BLOCKED` |
| 年级班级拆页 | `/grades` 与 `/classes` 拆开 | 合并在 `/home/org-classes` | `src/nav.js` 组织路由旁 `PHASE2-BLOCKED` |
| 报表 / 短信 | `/statistics` 占位；找回密码有验证码发送 | 无报表路由；忘记密码不发短信 | `src/nav.js`、`src/components/LoginPage.vue` `PHASE2-BLOCKED` |

批量导入导出同样没有路由，跟报表一起不做。

## 截图

Framer 为 Desktop 帧导出。main 为 1440 宽整页。用户与学生列表因未连 camp-app 显示「网络不可用」，壳层尺寸仍按上面的计算样式。

| 图 | 说明 |
| --- | --- |
| [w4-framer-users.png](phase2-shots/w4-framer-users.png) | 母版：侧栏 200、无页标题、表、分页、表单预览 |
| [w4-framer-students.png](phase2-shots/w4-framer-students.png) | 首期帧：22px「校园OA / 学生信息」 |
| [w4-framer-dashboard.png](phase2-shots/w4-framer-dashboard.png) | 首期帧：问候标题，短侧栏 |
| [w4-framer-profile.png](phase2-shots/w4-framer-profile.png) | 旧个人中心：264 侧栏 + 24px 标题 |
| [w4-framer-password.png](phase2-shots/w4-framer-password.png) | 旧改密：264 侧栏 + 窄卡片 |
| [w4-framer-grades.png](phase2-shots/w4-framer-grades.png) | 年级拆页。PHASE2-BLOCKED |
| [w4-framer-classes.png](phase2-shots/w4-framer-classes.png) | 班级拆页。PHASE2-BLOCKED |
| [w4-framer-statistics.png](phase2-shots/w4-framer-statistics.png) | 报表占位。PHASE2-BLOCKED |
| [w4-main-users.png](phase2-shots/w4-main-users.png) | main 用户：无页标题，表单预览 |
| [w4-main-students.png](phase2-shots/w4-main-students.png) | main 学生：无「校园OA / 学生信息」 |
| [w4-main-profile.png](phase2-shots/w4-main-profile.png) | main 个人中心表单预览壳 |
| [w4-main-password.png](phase2-shots/w4-main-password.png) | main 改密同宽预览壳 |
| [w4-main-org.png](phase2-shots/w4-main-org.png) | 年级 / 班级仍合并 |
| [w4-main-dashboard.png](phase2-shots/w4-main-dashboard.png) | 问候保留，侧栏 200 |
| [w4-main-login.png](phase2-shots/w4-main-login.png) | 登录 |
| [w4-main-sms.png](phase2-shots/w4-main-sms.png) | 忘记密码不发短信 |

## 本轮不动

- `src/styles/tokens.css` 的 `--sidebar-width`、`--pager-pad`、`--nav-fg`、`--nav-fg-active`、`--nav-weight`
- 不恢复 `.page-head`
- 不把个人中心改回 Framer 的 264 侧栏和 24px 标题
- 不实现换肤 UI、年级班级拆页、报表和短信
