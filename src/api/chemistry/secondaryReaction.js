import request from '@/utils/request'

/**
 * 查询副反应列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listSecondaryReaction(query) {
  return request({
    url: '/glxt/chemistry/secondaryReaction/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询副反应详细
 * @param {number|string} id - 副反应ID
 * @returns {Promise}
 */
export function getSecondaryReaction(id) {
  return request({
    url: '/glxt/chemistry/secondaryReaction/' + id,
    method: 'get'
  })
}

/**
 * 根据主反应查询副反应
 * @param {number|string} mainEquationId - 主反应ID
 * @returns {Promise}
 */
export function getSecondaryByMainEquation(mainEquationId) {
  return request({
    url: '/glxt/chemistry/secondaryReaction/mainEquation/' + mainEquationId,
    method: 'get'
  })
}

/**
 * 新增副反应
 * @param {object} data - 副反应数据
 * @returns {Promise}
 */
export function addSecondaryReaction(data) {
  return request({
    url: '/glxt/chemistry/secondaryReaction',
    method: 'post',
    data: data
  })
}

/**
 * 修改副反应
 * @param {object} data - 副反应数据
 * @returns {Promise}
 */
export function updateSecondaryReaction(data) {
  return request({
    url: '/glxt/chemistry/secondaryReaction',
    method: 'put',
    data: data
  })
}

/**
 * 删除副反应
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delSecondaryReaction(ids) {
  return request({
    url: '/glxt/chemistry/secondaryReaction/' + ids,
    method: 'delete'
  })
}

/**
 * 导出副反应
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportSecondaryReaction(query) {
  return request({
    url: '/glxt/chemistry/secondaryReaction/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
