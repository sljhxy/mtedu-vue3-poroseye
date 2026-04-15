import request from '@/utils/request'

/**
 * 查询化学方程式列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listEquation(query) {
  return request({
    url: '/glxt/chemistry/equation/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询化学方程式详细
 * @param {number|string} id - 方程式ID
 * @returns {Promise}
 */
export function getEquation(id) {
  return request({
    url: '/glxt/chemistry/equation/' + id,
    method: 'get'
  })
}

/**
 * 根据反应类型查询方程式
 * @param {string} reactionTypeCode - 反应类型代码
 * @returns {Promise}
 */
export function getEquationByType(reactionTypeCode) {
  return request({
    url: '/glxt/chemistry/equation/type/' + reactionTypeCode,
    method: 'get'
  })
}

/**
 * 根据难度查询方程式
 * @param {string} difficultyLevel - 难度等级
 * @returns {Promise}
 */
export function getEquationByDifficulty(difficultyLevel) {
  return request({
    url: '/glxt/chemistry/equation/difficulty/' + difficultyLevel,
    method: 'get'
  })
}

/**
 * 根据反应物查找反应
 * @param {Array} reactantIds - 反应物ID数组
 * @returns {Promise}
 */
export function findEquationByReactants(reactantIds) {
  return request({
    url: '/glxt/chemistry/equation/findByReactants',
    method: 'post',
    data: { reactantIds }
  })
}

/**
 * 新增化学方程式
 * @param {object} data - 方程式数据
 * @returns {Promise}
 */
export function addEquation(data) {
  return request({
    url: '/glxt/chemistry/equation',
    method: 'post',
    data: data
  })
}

/**
 * 修改化学方程式
 * @param {object} data - 方程式数据
 * @returns {Promise}
 */
export function updateEquation(data) {
  return request({
    url: '/glxt/chemistry/equation',
    method: 'put',
    data: data
  })
}

/**
 * 删除化学方程式
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delEquation(ids) {
  return request({
    url: '/glxt/chemistry/equation/' + ids,
    method: 'delete'
  })
}

/**
 * 导出化学方程式
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportEquation(query) {
  return request({
    url: '/glxt/chemistry/equation/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
