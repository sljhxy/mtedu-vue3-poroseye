import request from '@/utils/request'

/**
 * 查询中间产物列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listIntermediate(query) {
  return request({
    url: '/glxt/chemistry/intermediate/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询中间产物详细
 * @param {number|string} id - 中间产物ID
 * @returns {Promise}
 */
export function getIntermediate(id) {
  return request({
    url: '/glxt/chemistry/intermediate/' + id,
    method: 'get'
  })
}

/**
 * 根据方程式ID查询中间产物
 * @param {number|string} equationId - 方程式ID
 * @returns {Promise}
 */
export function getIntermediateByEquationId(equationId) {
  return request({
    url: '/glxt/chemistry/intermediate/equation/' + equationId,
    method: 'get'
  })
}

/**
 * 根据阶段ID查询中间产物
 * @param {number|string} stageId - 阶段ID
 * @returns {Promise}
 */
export function getIntermediateByStageId(stageId) {
  return request({
    url: '/glxt/chemistry/intermediate/stage/' + stageId,
    method: 'get'
  })
}

/**
 * 新增中间产物
 * @param {object} data - 中间产物数据
 * @returns {Promise}
 */
export function addIntermediate(data) {
  return request({
    url: '/glxt/chemistry/intermediate',
    method: 'post',
    data: data
  })
}

/**
 * 修改中间产物
 * @param {object} data - 中间产物数据
 * @returns {Promise}
 */
export function updateIntermediate(data) {
  return request({
    url: '/glxt/chemistry/intermediate',
    method: 'put',
    data: data
  })
}

/**
 * 删除中间产物
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delIntermediate(ids) {
  return request({
    url: '/glxt/chemistry/intermediate/' + ids,
    method: 'delete'
  })
}

/**
 * 导出中间产物
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportIntermediate(query) {
  return request({
    url: '/glxt/chemistry/intermediate/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
