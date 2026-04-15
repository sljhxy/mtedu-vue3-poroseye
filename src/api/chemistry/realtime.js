import request from '@/utils/request'

/**
 * 启动实时模拟
 * 接口地址: POST /chemistry/simulation/start-realtime
 */
export function startRealtimeSimulation(data) {
  return request({
    url: '/glxt/chemistry/simulation/start-realtime',
    method: 'post',
    data: data
  })
}

/**
 * 获取模拟状态
 * 接口地址: GET /chemistry/simulation/{simulationId}
 */
export function getSimulationStatus(simulationId) {
  return request({
    url: '/glxt/chemistry/simulation/' + simulationId,
    method: 'get'
  })
}

/**
 * 控制模拟
 * 接口地址: POST /chemistry/simulation/{simulationId}/control
 */
export function controlSimulation(simulationId, action) {
  return request({
    url: '/glxt/chemistry/simulation/' + simulationId + '/control',
    method: 'post',
    data: { action }
  })
}

/**
 * 添加物质
 * 接口地址: POST /chemistry/simulation/{simulationId}/add-substance
 */
export function addSubstance(simulationId, data) {
  return request({
    url: '/glxt/chemistry/simulation/' + simulationId + '/add-substance',
    method: 'post',
    data: data
  })
}

/**
 * 获取最终结果
 * 接口地址: GET /chemistry/simulation/{simulationId}/result
 */
export function getSimulationResult(simulationId) {
  return request({
    url: '/glxt/chemistry/simulation/' + simulationId + '/result',
    method: 'get'
  })
}

/**
 * 创建 WebSocket 连接
 * @param {string} simulationId - 模拟ID
 * @returns {WebSocket} WebSocket实例
 */
export function createSimulationWebSocket(simulationId) {
  // 根据当前环境动态构造 WebSocket URL
  // 开发环境：ws://localhost/dev-api/...
  // 生产环境：根据协议使用 ws:// 或 wss://，走 /prod-api/...
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  const basePath = import.meta.env.VITE_APP_BASE_API || '/dev-api'
  const wsUrl = `${protocol}//${host}${basePath}/glxt/chemistry/simulation/stream/${simulationId}`
  return new WebSocket(wsUrl)
}

/**
 * 预测反应（即时反馈）
 * 接口地址: POST /chemistry/simulation/predict
 * @param {object} data - 反应请求
 * @returns {Promise}
 */
export function predictReaction(data) {
  return request({
    url: '/glxt/chemistry/simulation/predict',
    method: 'post',
    data: data
  })
}

/**
 * 诊断反应失败原因
 * 接口地址: POST /chemistry/simulation/diagnose
 * @param {object} data - 反应请求
 * @returns {Promise}
 */
export function diagnoseFailure(data) {
  return request({
    url: '/glxt/chemistry/simulation/diagnose',
    method: 'post',
    data: data
  })
}

/**
 * 诊断模拟失败原因
 * 接口地址: GET /chemistry/simulation/{simulationId}/diagnose
 * @param {string} simulationId - 模拟ID
 * @returns {Promise}
 */
export function diagnoseSimulationFailure(simulationId) {
  return request({
    url: '/glxt/chemistry/simulation/' + simulationId + '/diagnose',
    method: 'get'
  })
}
