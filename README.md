# Camp Web - 校园OA系统前端

Vue 3 + Vite 前端项目

## 技术栈

- Vue 3 (Composition API)
- Vite
- JavaScript (ES6+)

## 功能特性

- ✅ 三类身份登录（学生、教工、家长/访客）
- ✅ 首次登录激活（设置密码）
- ✅ 学号/工号登录
- ✅ 密码验证和错误提示
- ✅ 响应式设计

## 项目结构

```
camp-web/
├── src/
│   ├── api/                    # API服务
│   │   └── auth.js            # 认证API
│   ├── components/             # Vue组件
│   │   ├── LoginPage.vue      # 登录页面
│   │   └── ActivatePasswordDialog.vue  # 激活密码对话框
│   ├── config/                 # 配置文件
│   │   └── api.js             # API配置
│   ├── App.vue                # 根组件
│   ├── main.js                # 入口文件
│   └── style.css              # 全局样式
├── public/                    # 公共资源
├── index.html                 # HTML模板
├── vite.config.js             # Vite配置
└── package.json               # 项目配置
```

## 开发

### 安装依赖

```bash
npm install
```

### 配置 API 地址

本地联调 camp-app 时，把 `VITE_API_BASE_URL` 留空。`npm run dev` 会把 `/api` 代理到 `http://localhost:8080`，浏览器不跨域。

只有后端已开 CORS、需要浏览器直连时，再在 `.env` 里写：

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 与 camp-app 联调（profile=dev）

下面这些请求头**只给后端 `profile=dev` 使用**。生产环境的后端不会按它们认人。`npm run dev` 会自动带上。生产构建默认不带；如果要用生产包去打 dev 后端，构建时加 `VITE_API_PROFILE=dev`。

Axios 请求拦截器规则：

- 还没有真实访问令牌时，默认 `Authorization: Bearer dev-TEACHER`。
- 用种子账号切换身份后，改为 `Bearer dev-<ROLE>`。`ROLE` 只取 `ADMIN`、`ACADEMIC`、`TEACHER`、`STUDENT`。家长账号的角色是 `STUDENT`，因此发送 `Bearer dev-STUDENT`。
- 同时带上当前种子用户的 `X-Dev-User-Id`、`X-Dev-Class-Ids`（逗号分隔）、`X-Dev-Grade-Ids`（逗号分隔）。没有班级或年级时省略对应头。
- **不发送 `X-Dev-Role`。** 身份以 `Authorization: Bearer dev-<ROLE>` 为准；如果两者同时出现，也只保留 Bearer。
- 本地已经有真实访问令牌（不是 `mock.` / `mock-` 前缀，也不是 `dev-ROLE`）时，只发送 `Authorization: Bearer <token>`，并去掉全部 `X-Dev-*`。

种子用户与开发头对照：

| 账号 | Bearer | X-Dev-User-Id | X-Dev-Class-Ids | X-Dev-Grade-Ids |
| --- | --- | --- | --- | --- |
| 未登录 | `dev-TEACHER` | 不发送 | 不发送 | 不发送 |
| `admin` | `dev-ADMIN` | `u-admin` | 不发送 | 不发送 |
| `A1001` | `dev-ACADEMIC` | `u-academic` | 不发送 | 不发送 |
| `T1001` 王老师 | `dev-TEACHER` | `t-wang` | `c12,c13,c21` | `1,2` |
| `T1002` 赵老师 | `dev-TEACHER` | `u-zhao` | `c11` | `1` |
| `20240101` 李明 | `dev-STUDENT` | `u-liming` | `c13` | `1` |
| `P1001` 家长 | `dev-STUDENT` | `u-parent` | `c13` | `1` |

年级编号：`1` 高一，`2` 高二，`3` 高三。班级编号与首期种子数据一致（如 `c13` 为高一(3)班）。

演示账号密码与数据库种子一致，均为 `Demo@123456`。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 登录功能说明

### 学生登录

1. 选择"学生"身份
2. 输入学号
3. **首次登录**：
   - 输入姓名进行验证
   - 如果学号与姓名匹配，弹出密码设置对话框
   - 设置密码（至少6位）
   - 激活成功后自动登录
4. **正常登录**：
   - 输入学号和密码
   - 登录成功

### 教工登录

1. 选择"教工"身份
2. 输入工号
3. **首次登录**：
   - 输入姓名进行验证
   - 如果工号与姓名匹配，弹出密码设置对话框
   - 设置密码（至少6位）
   - 激活成功后自动登录
4. **正常登录**：
   - 输入工号和密码
   - 登录成功

### 家长/访客

- 仅显示按钮，功能暂未开放

## API接口

### 登录接口

**POST** `/api/auth/login`

请求体：
```json
{
  "identityType": 1,
  "identifier": "20240001",
  "realName": "张三",
  "password": "Demo@123456"
}
```

### 激活接口

**POST** `/api/auth/activate`

请求体：
```json
{
  "identityType": 1,
  "identifier": "20240001",
  "realName": "张三",
  "password": "Demo@123456"
}
```

详细API文档请参考后端项目：`camp-app/project_doc/guides/LOGIN_GUIDE.md`

## 使用说明

1. **启动后端服务**（camp-app）
   ```bash
   cd camp-app
   ./gradlew bootRun
   ```

2. **启动前端服务**（camp-web）
   ```bash
   cd camp-web
   npm run dev
   ```

3. **访问登录页面**
   - 打开浏览器访问 http://localhost:3000
   - 选择身份类型（学生/教工）
   - 输入学号/工号进行登录

## 注意事项

1. 确保后端服务已启动（默认端口8080）
2. 首次登录需要验证姓名并设置密码
3. 密码长度不能少于6位
4. 登录成功后，用户信息和Token会保存在localStorage中

## 后续开发

- [ ] 添加路由管理（vue-router）
- [ ] 添加状态管理（Pinia）
- [ ] 实现主页和其他功能页面
- [ ] 添加Token刷新机制
- [ ] 添加请求拦截器
- [ ] 优化错误处理
