# W5 二期合入验收口径

本文只规定二期如何合入 `main`。合入本文的变更不新开功能，也不改业务代码与样式。

前端里程碑见 [`docs/PHASE2-PLAN.md`](https://github.com/sunz0037/camp-web/blob/cursor/phase2-campus-oa/docs/PHASE2-PLAN.md)（[camp-web #2](https://github.com/sunz0037/camp-web/pull/2) 的 `cursor/phase2-campus-oa`）。该文件随 #2 进入 `main` 后，以仓库内路径为准。计划里的勾选不代替下面的闸门。

## 1. 合入闸门

按顺序合入。每一支合入前基于当时的 `main`（变基或改基线）。后一支基于已经包含前一支的 `main`。

1. [camp-app #3](https://github.com/sunz0037/camp-app/pull/3)：首期接口对齐。已在 `main`。
2. [camp-app #4](https://github.com/sunz0037/camp-app/pull/4)：DDL。
3. [camp-app #5](https://github.com/sunz0037/camp-app/pull/5)：密码。
4. API：以 [camp-app #7](https://github.com/sunz0037/camp-app/pull/7) 为合入支。#7 吞并 [camp-app #6](https://github.com/sunz0037/camp-app/pull/6)，或在合入说明里写清两支分工后只合约定的一支。
5. [camp-web #2](https://github.com/sunz0037/camp-web/pull/2) → [#3](https://github.com/sunz0037/camp-web/pull/3) → [#4](https://github.com/sunz0037/camp-web/pull/4)。

写作本文时，camp-app #4 起、camp-web #2 起仍基于首期功能分支，尚未满足「全部基于 `main`」。

## 2. 功能过线

四项同时满足才过线：

- 四角色冒烟：管理员、教务、教师、学生。登录后侧栏入口和写按钮与角色一致。
- 学生、用户、课程、公告的写路径可用：保存成功，列表刷新。
- 缺接口只标 `PHASE2-BLOCKED`（代码旁注释，并写入联调清单）。
- 考试、访客、文件至少一域可以演示。

## 3. 视觉锁

下列取值禁止回改。

| 项 | 锁定值 | 落点 |
| --- | --- | --- |
| 侧栏 | 200 | `--sidebar-width: 200px` |
| 列表 | 无 `.page-head` | 管理列表保持无大标题条 |
| 表 | 10×16 | `table.data` 的 `th` / `td`：`padding: 10px 16px` |
| 分页脚 | 12×16 | `--pager-pad: 12px 16px` |
| 导航 | `#8B90A5` / `#5B6CF0` / 字重 400 | `--nav-fg` / `--nav-fg-active` / `--nav-weight` |

令牌在 `src/styles/tokens.css`，表内边距在 `src/styles/oa.css`。

## 4. 后置

不作为本次合入条件：

- 年级、班级拆页
- 报表
- 短信
- 主题 UI

## 5. 交付物

收口时带上：

- camp-app 与 camp-web 的 README（联调入口、账号、端口）
- 联调清单（含仍为 `PHASE2-BLOCKED` 的接口）
- 关键截图（一条写路径，以及已演示的考试 / 访客 / 文件域）

需求在下表签字后，二期范围收口。

| 角色 | 结论 | 日期 |
| --- | --- | --- |
| 需求 | | |
