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

### 配置API地址

创建 `.env` 文件（参考 `.env.example`）：

```bash
VITE_API_BASE_URL=http://localhost:8080
```

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
  "password": "123456"
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
  "password": "123456"
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
