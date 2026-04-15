import request from '@/utils/request'

/**
 * 查询物质库列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listSubstance(query) {
  return request({
    url: '/glxt/chemistry/substance/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询物质库详细
 * @param {number|string} id - 物质ID
 * @returns {Promise}
 */
export function getSubstance(id) {
  return request({
    url: '/glxt/chemistry/substance/' + id,
    method: 'get'
  })
}

/**
 * 根据化学式查询物质
 * @param {string} formula - 化学式（如 H2O、CO2）
 * @returns {Promise}
 */
export function getSubstanceByFormula(formula) {
  return request({
    url: '/glxt/chemistry/substance/formula/' + formula,
    method: 'get'
  })
}

/**
 * 根据类型查询物质
 * @param {string} substanceType - 物质类型
 * @returns {Promise}
 */
export function getSubstanceByType(substanceType) {
  return request({
    url: '/glxt/chemistry/substance/type/' + substanceType,
    method: 'get'
  })
}

/**
 * 搜索物质
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchSubstance(keyword) {
  return request({
    url: '/glxt/chemistry/substance/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 新增物质库
 * @param {object} data - 物质数据
 * @returns {Promise}
 */
export function addSubstance(data) {
  return request({
    url: '/glxt/chemistry/substance',
    method: 'post',
    data: data
  })
}

/**
 * 修改物质库
 * @param {object} data - 物质数据
 * @returns {Promise}
 */
export function updateSubstance(data) {
  return request({
    url: '/glxt/chemistry/substance',
    method: 'put',
    data: data
  })
}

/**
 * 删除物质库
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delSubstance(ids) {
  return request({
    url: '/glxt/chemistry/substance/' + ids,
    method: 'delete'
  })
}

/**
 * 导出物质库
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportSubstance(query) {
  return request({
    url: '/glxt/chemistry/substance/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 获取物质建议用量
 * @param {number|string} id - 物质ID
 * @returns {Promise}
 */
export function getSubstanceRecommendation(id) {
  return request({
    url: '/glxt/chemistry/substance/recommendation/' + id,
    method: 'get'
  })
}

/**
 * 批量获取物质建议用量
 * @param {string} ids - 物质ID列表（逗号分隔）
 * @returns {Promise}
 */
export function getSubstanceRecommendations(ids) {
  return request({
    url: '/glxt/chemistry/substance/recommendations',
    method: 'get',
    params: { ids }
  })
}
