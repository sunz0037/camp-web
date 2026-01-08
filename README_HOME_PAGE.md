# 首页（Home Page）功能说明

## 功能概述

首页包含以下三个主要模块：

1. **用户基本信息展示**
   - 用户头像（如果有）
   - 姓名
   - 学号/工号
   - 身份类型

2. **日历组件**
   - 显示当前月份的日历
   - 支持切换月份
   - 高亮显示今天
   - 支持选择日期

3. **天气信息**
   - 自动获取当前位置的天气（需要位置授权）
   - 如果未获得位置授权，默认显示北京天气
   - 显示温度、天气状况、湿度、风速等信息
   - 支持手动请求位置权限

## 技术实现

### 路由配置

- 路由路径：`/home`
- 需要登录认证（`meta: { requiresAuth: true }`）
- 未登录用户访问会自动跳转到登录页

### 组件结构

```
src/
├── views/
│   └── HomePage.vue          # 首页组件
├── api/
│   └── weather.js            # 天气API服务
└── router/
    └── index.js               # 路由配置
```

### 依赖

- `vue-router@4` - 路由管理
- Vue 3 Composition API

## 使用说明

### 1. 访问首页

登录成功后，系统会自动跳转到首页（`/home`）。

### 2. 用户信息

首页左侧显示用户基本信息：
- 头像：如果有头像URL则显示头像，否则显示姓名首字符
- 姓名、学号/工号、身份类型

### 3. 日历功能

- 点击左右箭头切换月份
- 今天会高亮显示（蓝色背景）
- 点击日期可以选中（紫色背景）

### 4. 天气功能

#### 自动获取位置

页面加载时，系统会尝试获取用户位置：
- 如果浏览器支持且用户授权，显示当前位置的天气
- 如果用户拒绝授权或浏览器不支持，默认显示北京天气

#### 手动请求位置

点击"获取位置"按钮可以重新请求位置权限。

#### 天气信息显示

- 位置信息
- 天气图标（emoji）
- 温度（摄氏度）
- 天气状况（晴/多云/阴等）
- 湿度（百分比）
- 风速（km/h）

## 天气API说明

### 当前实现

目前使用**模拟数据**，原因：
- OpenWeatherMap等天气API需要API key
- 避免在开发阶段产生API调用费用

### 集成真实天气API

如果需要集成真实的天气API，可以：

1. **申请API Key**
   - OpenWeatherMap: https://openweathermap.org/api
   - 和风天气: https://dev.qweather.com/
   - 高德天气: https://lbs.amap.com/api/webservice/guide/api/weatherinfo

2. **修改 `src/api/weather.js`**

```javascript
// 示例：使用OpenWeatherMap
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export const getWeatherByCity = async (city = '北京') => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=zh_cn`
  )
  const data = await response.json()
  return {
    success: true,
    data: {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6)
    }
  }
}
```

3. **配置环境变量**

在 `.env` 文件中添加：
```
VITE_WEATHER_API_KEY=your_api_key_here
```

## 样式说明

- 使用渐变背景（紫色主题）
- 响应式设计，支持移动端
- 卡片式布局，圆角设计
- 现代化的UI风格

## 路由守卫

首页受路由守卫保护：
- 未登录用户访问 `/home` 会自动跳转到 `/login`
- 已登录用户访问 `/login` 会自动跳转到 `/home`

## 退出登录

点击右上角"退出登录"按钮：
- 清除本地存储的token和用户信息
- 跳转到登录页

## 注意事项

1. **位置权限**：首次访问时，浏览器会询问位置权限，用户可以选择允许或拒绝
2. **天气数据**：当前使用模拟数据，实际部署时需要配置真实的天气API
3. **跨域问题**：如果使用第三方天气API，可能需要配置CORS或使用代理

## 后续优化建议

1. 添加更多天气信息（如未来7天预报）
2. 支持手动切换城市
3. 添加天气图标库（替代emoji）
4. 优化移动端体验
5. 添加加载动画和骨架屏
6. 缓存天气数据，减少API调用

