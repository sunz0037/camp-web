# camp-oa 二期剩余队列（camp-web）

后续 Cursor 任务按本文勾选开工。一次只做队列里的一行，并守住下面的硬约束。

合入闸门与视觉锁以 [`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) 为准。更早的 [`docs/PHASE2-PLAN.md`](PHASE2-PLAN.md)、[`docs/phase2-progress.md`](phase2-progress.md) 仍写着 M3–M5 未做，那份勾选已过时，不要按它重开已经合进 `main` 的表单、考试访客页或个人中心。

视觉源：Framer [zanqPCAZWIynxQtljR9c](https://framer.com/projects/zanqPCAZWIynxQtljR9c)，母版页 `/users`。

## 已收口（勿重开）

W0–W3 已在 `main`。个人中心对齐是这之后的单独合入，不属于剩余队列。

| 项 | 内容 | 落点 |
| --- | --- | --- |
| W0–W3 | 壳层 v1.3.4；Sprint A 权限与组织关联列表；学生 / 用户 / 课程 / 考勤 / 公告真表单，年级班级 Tab 深链，我的课表；考试、成绩、访客、改密与主题客户端 | [camp-web #1](https://github.com/sunz0037/camp-web/pull/1)、[#2](https://github.com/sunz0037/camp-web/pull/2)、[#4](https://github.com/sunz0037/camp-web/pull/4)，截图 `docs/v1.3-shots/` |
| 个人中心对齐 | 个人中心、修改密码与 `/users` 同一套表单预览 | [camp-web #6](https://github.com/sunz0037/camp-web/pull/6)、[#7](https://github.com/sunz0037/camp-web/pull/7)、[#8](https://github.com/sunz0037/camp-web/pull/8) |
| 验收口径 | 合入闸门、功能过线、视觉锁、后置项 | [camp-web #5](https://github.com/sunz0037/camp-web/pull/5)，[`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) |

W5 四角色冒烟另有任务在写，见下文「归档路径」。本队列不重跑冒烟，也不改壳层 v1.3.4。

## 硬约束

下列取值禁止回改。令牌在 `src/styles/tokens.css`，表内边距在 `src/styles/oa.css`。与 [`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) 第 3 节同一张锁。

| 项 | 锁定值 |
| --- | --- |
| 侧栏 | `--sidebar-width: 200px` |
| 列表 | 无 `.page-head` |
| 表 | `table.data` 的 `th` / `td`：`padding: 10px 16px` |
| 分页脚 | `--pager-pad: 12px 16px` |
| 导航 | `--nav-fg: #8B90A5`，`--nav-fg-active: #5B6CF0`，`--nav-weight: 400` |

## 队列

| ID | 状态 | 可以开工的条件 |
| --- | --- | --- |
| W4 体验 | 未做 | 现在可以。对稿并补 `docs/w4-shots/`；壳层五项锁定值不动 |
| P2+ 年级班级拆页 | PHASE2-BLOCKED / 后置 | 产品确认拆成 `/grades` 与 `/classes` |
| P2+ 报表 | PHASE2-BLOCKED / 后置 | camp-app 提供 `/statistics/**` |
| P2+ 短信 | PHASE2-BLOCKED / 后置 | `camp.sms.enabled=true` 且验证码契约落地 |
| P2+ 主题 UI | PHASE2-BLOCKED / 后置 | 产品把换肤列为当期。接口已经在 camp-app |
| W5 收口 | 冒烟进行中 | [camp-web #9](https://github.com/sunz0037/camp-web/pull/9) 合入后，只补勾选与 camp-app 短链 |

## W4 体验

对 Framer `/users` 母版核对 v1.3.4 的侧栏、导航和表单密度。侧栏、导航色、表 10×16、pager、无 `.page-head` 只核对、不改值。个人中心和改密可以改到与 `/users` 同一套 `preview-card` 密度（边框、字号、与内容区同宽），改动不得碰到硬约束。

已有壳层图继续用，不重拍 v1.3.4：

- `docs/v1.3-shots/sidebar-v134.png`
- `docs/v1.3-shots/nav-v134.png`

### 对照截图验收包

新图放 `docs/w4-shots/`。个人中心与 `/users` 用同一视口（1280 宽、已登录管理员）。每行收口时把「结论」改成「一致」或写明实测数值。

| ID | 对照 | 路由 | 看什么 | 已有图 | 本波要补 | 结论 |
| --- | --- | --- | --- | --- | --- | --- |
| W4-1 | 侧栏 | 任意已登录页 | 宽 200 | `docs/v1.3-shots/sidebar-v134.png` | 不重拍。偏离只记缺陷 | 待核 |
| W4-2 | 导航 | 侧栏当前项 | `#8B90A5` / `#5B6CF0` / 字重 400，图标 `currentColor` | `docs/v1.3-shots/nav-v134.png` | 不重拍。偏离只记缺陷 | 待核 |
| W4-3 | 用户列表母版 | `/home/users` | 无 `.page-head`；`preview-card`；表 10×16；pager 12×16 | `docs/v1.3-shots/users-v133.png`（更早量测） | `docs/w4-shots/users.png` | 待核 |
| W4-4 | 个人中心 vs 用户 | `/home/profile` | 与 `/users` 同一套 `preview-card` / `preview-grid`；`.field` 用 `--c-border`；卡片跟内容区同宽 | `docs/phase2-shots/profile-unified.png` | `docs/w4-shots/profile.png`，与 W4-3 并排 | 待核 |
| W4-5 | 改密 vs 用户 | `/home/change-password` | 同宽预览卡。禁止收回 560px 左贴窄卡 | `docs/phase2-shots/password-after.png` | `docs/w4-shots/password.png` | 待核 |
| W4-6 | 学生列表密度 | `/home/students` | 无 `.page-head`；表 10×16 | `docs/v1.3-shots/students-v133.png` | 与母版密度不一致时再补 `docs/w4-shots/students.png` | 待核 |
| W4-7 | 考试 / 成绩 / 访客壳 | `/home/exam-schedules`、`/home/scores`、`/home/visitors` | 已是同一套列表壳时记「沿用」，不要另起卡片 | `docs/v1.3-shots/exam-schedules-v2.png`、`exam-scores-v2.png`、`visitors-v2.png` | 壳不一致时再补 | 待核 |

收口条件：上表每行有结论；硬约束五项与对稿前相同；新截图只进 `docs/w4-shots/`，不覆盖 `docs/v1.3-shots/`。

## P2+ 后置

四项都标 **PHASE2-BLOCKED / 后置**，不作为 [`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) 第 4 节的合入条件。依赖解开之前不要开页面、不要造假保存成功。

### 年级班级拆页

现状是合并页 `/home/org-classes`，深链 `?tab=grades` 与 `?tab=classes&gradeId=`。`src/nav.js` 的 `note` 为「合并」，`noteTitle` 写明待产品确认后再拆 `/grades` 与 `/classes`。

依赖：写接口已经有，`POST/PUT/DELETE /api/v1/grades` 与 `/api/v1/classes`（[`docs/api-fe-notes.md`](api-fe-notes.md)）。缺的是产品对信息架构的确认。

解开后：保留合并页直到新路由可维护，再改侧栏。拆页仍然无 `.page-head`，侧栏仍是 200。

### 报表

现状：camp-app 二期契约写明独立 `/statistics/**` 与 GPA 未做（`project_doc/api/api-contract-v1-phase2.md`「明确不做」）。现行导航 `src/nav.js` 没有统计报表。`src/components/SidebarMenu.vue` 里有指向 `/home/statistics` 的项，该组件未挂到现行壳，不要把它接回来当报表页。

依赖：camp-app 的只读统计契约。解开后用现有列表壳，无 `.page-head`。

### 短信

现状：`LoginPage.vue` 写明短信通道未接入，找回密码走教务或管理员重置。camp-app `camp.sms.enabled=false`，短信验证码与公开找回不在本期契约。

依赖：短信开关与验证码接口。解开前不要在登录页加「发送验证码」。

### 主题 UI（暗色 / 校园绿）

接口已在 camp-app，UI 未暴露。

- camp-app：`GET/PUT /api/v1/me/settings`，`themeKey` 为 `default` / `dark` / `campus-green` / `campus-blue`，表 `sys_user_preferences`。见 camp-app `project_doc/api/api-contract-v1-phase2.md` N4。
- camp-web：`src/api/settings.js` 与 `src/stores/theme.js` 启动时拉取并写到 `html[data-theme]`。`src/styles/themes.css` 有 `dark` 与 `campus-green`。两处注释已是 `PHASE2-BLOCKED`。个人中心不渲染切换。
- 前端 `THEME_KEYS` 含 `default`、`dark`、`campus-green`，不含 `campus-blue`。`:root` 默认令牌保持 v1.3.4，换肤不得改写上表硬约束。

依赖：产品把换肤列为当期，并决定是否纳入 `campus-blue`。解开前个人中心和顶栏都不出现暗色 / 校园绿开关。参考图已在 `docs/v1.3-shots/theme-default.png`、`theme-dark.png`、`theme-campus-green.png`，那是令牌试色，不是已发布的入口。

## W5 收口

### 四角色冒烟归档路径

正文与截图固定用下面两处，避免再开一份：

| 记录 | 路径 |
| --- | --- |
| 冒烟正文 | `docs/W5-SMOKE.md` |
| 截图 | `docs/w5-shots/` |
| 过线口径 | [`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) 第 2 节（四角色、写路径、`PHASE2-BLOCKED`、考试 / 访客 / 文件至少一域） |
| 视觉锁 | [`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) 第 3 节 |

[camp-web #9](https://github.com/sunz0037/camp-web/pull/9)（`cursor/w5-smoke-3b65`）已按该路径在写。合入后把 PR 号填进下表。不要把冒烟结论抄进本文，也不要另开 `docs/smoke/`。

| 记录 | 路径 | 状态 |
| --- | --- | --- |
| 四角色冒烟 | `docs/W5-SMOKE.md` | 进行中，见 #9。本队列不重跑 |

### 双仓 README / 联调清单骨架

[`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) 第 5 节要求两仓 README、一份联调清单、关键截图。本仓库此前没有单独清单。README 的端口、账号和 dev 头已在「与 camp-app 联调」；二期状态短链指向本文。下面只填空，收口时不要重写整份 README。

camp-app 不在本 PR。它的 README 已有 H2、`8080`、演示账号和 dev 头，没有「二期剩余」短节。跟进放在 camp-app：加一行链到本文或该仓自己的剩余文档。

#### 入口

| 仓 | 联调入口 | 账号与端口 |
| --- | --- | --- |
| camp-web | README「与 camp-app 联调」 | Vite `5173`，`VITE_API_BASE=http://localhost:8080/api/v1`，密码 `Demo@123456`，Bearer `dev-ADMIN` / `dev-ACADEMIC` / `dev-TEACHER` / `dev-STUDENT` |
| camp-app | README「本地联调」「开发态鉴权」 | `./gradlew bootRun --args='--spring.profiles.active=h2'`，端口 `8080`，前缀 `/api/v1` |
| 写路径字段 | [`docs/api-fe-notes.md`](api-fe-notes.md) | 学生、用户、课程、考勤、公告、年级、班级 |
| 合入闸门 | [`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) | 第 1–3 节 |

#### 仍开放的 PHASE2-BLOCKED

| 项 | 依赖 | 前端落点 |
| --- | --- | --- |
| 年级班级拆页 | 产品确认信息架构；接口已有 | `src/nav.js` 的 `org-classes` |
| 报表 | camp-app 无 `/statistics/**` | 不要接 `SidebarMenu.vue` |
| 短信 | `camp.sms.enabled=false` | `src/components/LoginPage.vue` 文案 |
| 主题 UI | `GET/PUT /api/v1/me/settings` 已有；页面不展示切换 | `src/api/settings.js`、`src/stores/theme.js` |

#### 收口时勾选

- [ ] `docs/W5-SMOKE.md` 已合入 `main`（沿用 #9 的路径）
- [ ] 上表与冒烟记录里的 `PHASE2-BLOCKED` 一致
- [ ] camp-web README 仍只保留指向本文的短链
- [ ] camp-app README 补上二期剩余短链（另一仓库）
- [ ] 需求在 [`docs/W5-ACCEPTANCE.md`](W5-ACCEPTANCE.md) 签字表签字
