# 构建指南

## 构建前检查清单

### 1. 环境要求

- **Node.js**: v16.0.0 或更高版本
- **npm**: v7.0.0 或更高版本（通常随Node.js一起安装）

检查版本：
```bash
node --version
npm --version
```

### 2. 安装依赖

```bash
cd camp-web
npm install
```

这将安装以下依赖：
- `vue`: ^3.4.15 - Vue 3框架
- `@vitejs/plugin-vue`: ^5.0.3 - Vite Vue插件
- `vite`: ^5.0.11 - Vite构建工具

### 3. 文件完整性检查

确保以下文件存在：

```
camp-web/
├── package.json          ✅ 项目配置
├── vite.config.js       ✅ Vite配置
├── index.html           ✅ HTML模板
├── src/
│   ├── main.js          ✅ 入口文件
│   ├── App.vue          ✅ 根组件
│   ├── style.css        ✅ 全局样式
│   ├── api/
│   │   └── auth.js      ✅ API服务
│   ├── components/
│   │   ├── LoginPage.vue              ✅ 登录页面
│   │   └── ActivatePasswordDialog.vue  ✅ 激活对话框
│   └── config/
│       └── api.js       ✅ API配置
```

## 构建步骤

### 开发模式

```bash
npm run dev
```

启动开发服务器，默认访问：http://localhost:3000

### 生产构建

```bash
npm run build
```

构建输出目录：`dist/`

构建产物：
- `dist/index.html` - HTML文件
- `dist/assets/` - JS、CSS等静态资源

### 预览构建结果

```bash
npm run preview
```

预览生产构建，默认访问：http://localhost:4173

## 构建验证

### 1. 检查构建输出

构建成功后，检查 `dist/` 目录：

```bash
ls -la dist/
```

应该包含：
- `index.html`
- `assets/` 目录（包含JS和CSS文件）

### 2. 检查文件大小

```bash
du -sh dist/
```

构建产物应该合理（通常几MB以内）

### 3. 检查控制台错误

在浏览器中打开构建后的页面，检查：
- 浏览器控制台无错误
- 网络请求正常
- 页面正常渲染

## 常见构建问题

### 1. 依赖安装失败

**问题**：`npm install` 失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 2. 构建失败 - 模块未找到

**问题**：`Cannot find module 'xxx'`

**解决方案**：
- 确保所有依赖已安装：`npm install`
- 检查 `package.json` 中的依赖是否正确

### 3. 构建失败 - 语法错误

**问题**：Vue组件语法错误

**解决方案**：
- 检查Vue组件语法
- 确保所有 `import` 路径正确
- 检查是否有未关闭的标签

### 4. API请求失败

**问题**：构建后API请求失败

**解决方案**：
- 检查 `src/config/api.js` 中的API地址配置
- 确保后端服务运行正常
- 检查CORS配置

## 构建优化

### 1. 环境变量配置

创建 `.env.production` 文件：

```bash
VITE_API_BASE_URL=https://api.example.com
```

### 2. 代码分割

Vite会自动进行代码分割，无需额外配置。

### 3. 资源压缩

Vite在生产构建时会自动压缩JS和CSS。

## 部署

### 静态文件部署

构建后的 `dist/` 目录可以直接部署到：
- Nginx
- Apache
- 云存储（OSS、S3等）
- CDN

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name example.com;
    root /path/to/camp-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 验证清单

构建前确保：
- [ ] Node.js和npm已安装
- [ ] 所有依赖已安装（`npm install`）
- [ ] 所有源文件存在且语法正确
- [ ] API配置正确
- [ ] 无控制台错误

构建后验证：
- [ ] `dist/` 目录已生成
- [ ] `dist/index.html` 存在
- [ ] `dist/assets/` 目录包含JS和CSS文件
- [ ] 浏览器中页面正常显示
- [ ] API请求正常
- [ ] 登录功能正常

## 快速构建命令

```bash
# 完整构建流程
cd camp-web
npm install          # 安装依赖
npm run build        # 构建
npm run preview      # 预览（可选）
```

## 注意事项

1. **API地址**：生产环境需要配置正确的API地址
2. **CORS**：确保后端允许前端域名的跨域请求
3. **路由**：如果使用路由，需要配置服务器支持SPA
4. **环境变量**：使用 `VITE_` 前缀的环境变量

