/**
 * 天气API服务
 * 
 * 注意：由于OpenWeatherMap需要API key，这里使用模拟数据
 * 实际项目中应该：
 * 1. 申请OpenWeatherMap API key
 * 2. 或者使用其他免费的天气API（如和风天气、高德天气等）
 * 3. 配置API key到环境变量中
 */

// 模拟天气数据（用于开发测试）
const mockWeatherData = {
  '北京': {
    location: '北京',
    temperature: 22,
    condition: '晴',
    humidity: 65,
    windSpeed: 15
  },
  '上海': {
    location: '上海',
    temperature: 25,
    condition: '多云',
    humidity: 70,
    windSpeed: 12
  },
  '广州': {
    location: '广州',
    temperature: 28,
    condition: '晴',
    humidity: 75,
    windSpeed: 10
  }
}

/**
 * 根据城市名称获取天气（模拟）
 * @param {string} city - 城市名称，默认为'北京'
 * @returns {Promise<Object>} 天气数据
 */
export const getWeatherByCity = async (city = '北京') => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 如果有模拟数据，返回模拟数据
  if (mockWeatherData[city]) {
    return {
      success: true,
      data: mockWeatherData[city]
    }
  }
  
  // 否则返回随机生成的天气数据
  const conditions = ['晴', '多云', '阴', '小雨']
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
  
  return {
    success: true,
    data: {
      location: city,
      temperature: Math.floor(Math.random() * 10) + 15, // 15-25度
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
      windSpeed: Math.floor(Math.random() * 10) + 10 // 10-20 km/h
    }
  }
}

/**
 * 根据经纬度获取天气
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @returns {Promise<Object>} 天气数据
 */
export const getWeatherByCoords = async (lat, lon) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 这里应该调用真实的天气API
  // 例如：OpenWeatherMap API
  // const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
  // const response = await fetch(
  //   `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_cn`
  // )
  // const data = await response.json()
  
  // 目前返回模拟数据
  const conditions = ['晴', '多云', '阴']
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
  
  return {
    success: true,
    data: {
      location: '当前位置',
      temperature: Math.floor(Math.random() * 10) + 15,
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 30) + 50,
      windSpeed: Math.floor(Math.random() * 10) + 10
    }
  }
}

export default {
  getWeatherByCity,
  getWeatherByCoords
}

