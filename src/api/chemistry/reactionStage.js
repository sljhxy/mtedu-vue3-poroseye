import request from '@/utils/request'

/**
 * 查询反应阶段列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listReactionStage(query) {
  return request({
    url: '/glxt/chemistry/reactionStage/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询反应阶段详细
 * @param {number|string} id - 阶段ID
 * @returns {Promise}
 */
export function getReactionStage(id) {
  return request({
    url: '/glxt/chemistry/reactionStage/' + id,
    method: 'get'
  })
}

/**
 * 根据方程式ID查询阶段列表
 * @param {number|string} equationId - 方程式ID
 * @returns {Promise}
 */
export function getStageByEquationId(equationId) {
  return request({
    url: '/glxt/chemistry/reactionStage/equation/' + equationId,
    method: 'get'
  })
}

/**
 * 新增反应阶段
 * @param {object} data - 阶段数据
 * @returns {Promise}
 */
export function addReactionStage(data) {
  return request({
    url: '/glxt/chemistry/reactionStage',
    method: 'post',
    data: data
  })
}

/**
 * 修改反应阶段
 * @param {object} data - 阶段数据
 * @returns {Promise}
 */
export function updateReactionStage(data) {
  return request({
    url: '/glxt/chemistry/reactionStage',
    method: 'put',
    data: data
  })
}

/**
 * 删除反应阶段
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delReactionStage(ids) {
  return request({
    url: '/glxt/chemistry/reactionStage/' + ids,
    method: 'delete'
  })
}

/**
 * 导出反应阶段
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportReactionStage(query) {
  return request({
    url: '/glxt/chemistry/reactionStage/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
