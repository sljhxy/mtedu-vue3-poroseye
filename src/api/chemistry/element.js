import request from '@/utils/request'

/**
 * 查询元素周期表列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listElement(query) {
  return request({
    url: '/glxt/chemistry/element/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询元素周期表详细
 * @param {number|string} id - 元素ID（原子序数）
 * @returns {Promise}
 */
export function getElement(id) {
  return request({
    url: '/glxt/chemistry/element/' + id,
    method: 'get'
  })
}

/**
 * 根据符号查询元素
 * @param {string} symbol - 元素符号（如 H、O、Fe）
 * @returns {Promise}
 */
export function getElementBySymbol(symbol) {
  return request({
    url: '/glxt/chemistry/element/symbol/' + symbol,
    method: 'get'
  })
}

/**
 * 新增元素周期表
 * @param {object} data - 元素数据
 * @returns {Promise}
 */
export function addElement(data) {
  return request({
    url: '/glxt/chemistry/element',
    method: 'post',
    data: data
  })
}

/**
 * 修改元素周期表
 * @param {object} data - 元素数据
 * @returns {Promise}
 */
export function updateElement(data) {
  return request({
    url: '/glxt/chemistry/element',
    method: 'put',
    data: data
  })
}

/**
 * 删除元素周期表
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delElement(ids) {
  return request({
    url: '/glxt/chemistry/element/' + ids,
    method: 'delete'
  })
}

/**
 * 导出元素周期表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportElement(query) {
  return request({
    url: '/glxt/chemistry/element/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
