import request from '@/utils/request'

/**
 * 查询状态码分类列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listCategory(query) {
  return request({
    url: '/glxt/chemistry/status/category/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取分类树形结构
 * @returns {Promise}
 */
export function getCategoryTree() {
  return request({
    url: '/glxt/chemistry/status/category/tree',
    method: 'get'
  })
}

/**
 * 查询状态码分类详细
 * @param {number|string} id - 分类 ID
 * @returns {Promise}
 */
export function getCategory(id) {
  return request({
    url: '/glxt/chemistry/status/category/' + id,
    method: 'get'
  })
}

/**
 * 根据分类编码查询
 * @param {string} categoryCode - 分类编码
 * @returns {Promise}
 */
export function getCategoryByCode(categoryCode) {
  return request({
    url: '/glxt/chemistry/status/category/code/' + categoryCode,
    method: 'get'
  })
}

/**
 * 新增状态码分类
 * @param {object} data - 分类数据
 * @returns {Promise}
 */
export function addCategory(data) {
  return request({
    url: '/glxt/chemistry/status/category',
    method: 'post',
    data: data
  })
}

/**
 * 修改状态码分类
 * @param {object} data - 分类数据
 * @returns {Promise}
 */
export function updateCategory(data) {
  return request({
    url: '/glxt/chemistry/status/category',
    method: 'put',
    data: data
  })
}

/**
 * 删除状态码分类
 * @param {number|string|Array} ids - ID 或 ID 数组
 * @returns {Promise}
 */
export function delCategory(ids) {
  return request({
    url: '/glxt/chemistry/status/category/' + ids,
    method: 'delete'
  })
}

/**
 * 导出状态码分类
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportCategory(query) {
  return request({
    url: '/glxt/chemistry/status/category/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
