import request from '@/utils/request'

/**
 * 查询AI场景配置列表
 * @param {Object} query 查询参数
 */
export function listSceneConfig(query) {
  return request({
    url: '/glxt/api/sceneConfig/list',
    method: 'get',
    params: query
  })
}

/**
 * 根据场景标识获取配置ID
 * @param {String} sceneKey 场景标识
 * @param {Number} schoolId 学校ID（可选）
 * @param {Number} schoolType 学校类型（可选）
 */
export function getConfigIdByScene(sceneKey, schoolId, schoolType) {
  return request({
    url: '/glxt/api/sceneConfig/getConfigId',
    method: 'get',
    params: { sceneKey, schoolId, schoolType }
  })
}

/**
 * 查询AI场景配置详情
 * @param {Number} id 场景配置ID
 */
export function getSceneConfig(id) {
  return request({
    url: '/glxt/api/sceneConfig/' + id,
    method: 'get'
  })
}

/**
 * 新增AI场景配置
 * @param {Object} data 场景配置数据
 */
export function addSceneConfig(data) {
  return request({
    url: '/glxt/api/sceneConfig',
    method: 'post',
    data: data
  })
}

/**
 * 修改AI场景配置
 * @param {Object} data 场景配置数据
 */
export function updateSceneConfig(data) {
  return request({
    url: '/glxt/api/sceneConfig',
    method: 'put',
    data: data
  })
}

/**
 * 删除AI场景配置
 * @param {Number} id 场景配置ID
 */
export function delSceneConfig(id) {
  return request({
    url: '/glxt/api/sceneConfig/' + id,
    method: 'delete'
  })
}
