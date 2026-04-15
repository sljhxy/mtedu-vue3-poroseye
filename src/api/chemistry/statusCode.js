import request from '@/utils/request'

/**
 * 查询状态码列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listStatusCode(query) {
  return request({
    url: '/glxt/chemistry/status/code/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询状态码详细
 * @param {number|string} id - 状态码 ID
 * @returns {Promise}
 */
export function getStatusCode(id) {
  return request({
    url: '/glxt/chemistry/status/code/' + id,
    method: 'get'
  })
}

/**
 * 根据状态码编码查询
 * @param {string} statusCode - 状态码编码
 * @returns {Promise}
 */
export function getStatusCodeByCode(statusCode) {
  return request({
    url: '/glxt/chemistry/status/code/code/' + statusCode,
    method: 'get'
  })
}

/**
 * 批量查询状态码
 * @param {string} codes - 状态码编码列表（逗号分隔）
 * @returns {Promise}
 */
export function getStatusCodes(codes) {
  return request({
    url: '/glxt/chemistry/status/code/codes',
    method: 'get',
    params: { codes }
  })
}

/**
 * 根据分类 ID 查询状态码列表
 * @param {number|string} categoryId - 分类 ID
 * @returns {Promise}
 */
export function listStatusCodeByCategory(categoryId) {
  return request({
    url: '/glxt/chemistry/status/code/category/' + categoryId,
    method: 'get'
  })
}

/**
 * 搜索状态码
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchStatusCode(keyword) {
  return request({
    url: '/glxt/chemistry/status/code/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 新增状态码
 * @param {object} data - 状态码数据
 * @returns {Promise}
 */
export function addStatusCode(data) {
  return request({
    url: '/glxt/chemistry/status/code',
    method: 'post',
    data: data
  })
}

/**
 * 修改状态码
 * @param {object} data - 状态码数据
 * @returns {Promise}
 */
export function updateStatusCode(data) {
  return request({
    url: '/glxt/chemistry/status/code',
    method: 'put',
    data: data
  })
}

/**
 * 删除状态码
 * @param {number|string|Array} ids - ID 或 ID 数组
 * @returns {Promise}
 */
export function delStatusCode(ids) {
  return request({
    url: '/glxt/chemistry/status/code/' + ids,
    method: 'delete'
  })
}

/**
 * 导出状态码
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportStatusCode(query) {
  return request({
    url: '/glxt/chemistry/status/code/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
