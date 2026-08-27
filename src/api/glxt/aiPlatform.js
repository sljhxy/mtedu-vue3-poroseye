import request from '@/utils/request'

// 查询AI平台列表
export function listPlatform(query) {
  return request({
    url: '/glxt/ai/platform/list',
    method: 'get',
    params: query
  })
}

// 查询AI平台详细
export function getPlatform(id) {
  return request({
    url: '/glxt/ai/platform/' + id,
    method: 'get'
  })
}

// 新增AI平台
export function addPlatform(data) {
  return request({
    url: '/glxt/ai/platform',
    method: 'post',
    data: data
  })
}

// 修改AI平台
export function updatePlatform(data) {
  return request({
    url: '/glxt/ai/platform',
    method: 'put',
    data: data
  })
}

// 删除AI平台
export function delPlatform(ids) {
  return request({
    url: '/glxt/ai/platform/' + ids,
    method: 'delete'
  })
}

// 切换平台状态
export function togglePlatformStatus(id) {
  return request({
    url: '/glxt/ai/platform/toggleStatus/' + id,
    method: 'put'
  })
}

// 查询API配置列表
export function listApiConfig(query) {
  return request({
    url: '/glxt/api/config/list',
    method: 'get',
    params: query
  })
}

// 根据平台ID查询API配置
export function listApiConfigByPlatform(platformId) {
  return request({
    url: '/glxt/api/config/listByPlatform/' + platformId,
    method: 'get'
  })
}

// 查询API配置详细
export function getApiConfig(id) {
  return request({
    url: '/glxt/api/config/' + id,
    method: 'get'
  })
}

// 新增API配置
export function addApiConfig(data) {
  return request({
    url: '/glxt/api/config',
    method: 'post',
    data: data
  })
}

// 修改API配置
export function updateApiConfig(data) {
  return request({
    url: '/glxt/api/config',
    method: 'put',
    data: data
  })
}

// 删除API配置
export function delApiConfig(ids) {
  return request({
    url: '/glxt/api/config/' + ids,
    method: 'delete'
  })
}

// 切换API配置状态
export function toggleApiConfigStatus(id) {
  return request({
    url: '/glxt/api/config/toggleStatus/' + id,
    method: 'put'
  })
}

// 测试API配置
export function testApiConfig(configId) {
  return request({
    url: '/glxt/api/call/test/' + configId,
    method: 'get'
  })
}

// 高级测试API配置
export function advancedTestApiConfig(data) {
  return request({
    url: '/glxt/api/call/advancedTest',
    method: 'post',
    data: data,
    timeout: 60000 // 60秒超时
  })
}

// 调用AI API
export function callAiApi(data) {
  return request({
    url: '/glxt/api/call',
    method: 'post',
    data: data,
    timeout: 60000 // 60秒超时
  })
}

// 获取启用的预设平台列表
export function getActivePresets() {
  return request({
    url: '/glxt/ai/platform/preset/active',
    method: 'get'
  })
}
