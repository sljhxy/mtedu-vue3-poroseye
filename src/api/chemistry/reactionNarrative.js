import request from '@/utils/request'

/**
 * 查询反应描述列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listNarrative(query) {
  return request({
    url: '/glxt/chemistry/reactionNarrative/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询反应描述详细
 * @param {number|string} id - 描述ID
 * @returns {Promise}
 */
export function getNarrative(id) {
  return request({
    url: '/glxt/chemistry/reactionNarrative/' + id,
    method: 'get'
  })
}

/**
 * 根据方程式和类型查询描述
 * @param {number|string} equationId - 方程式ID
 * @param {string} type - 描述类型（student/teacher/detailed）
 * @returns {Promise}
 */
export function getNarrativeByEquationAndType(equationId, type = 'student') {
  return request({
    url: '/glxt/chemistry/reactionNarrative/equation/' + equationId,
    method: 'get',
    params: { type }
  })
}

/**
 * 新增反应描述
 * @param {object} data - 描述数据
 * @returns {Promise}
 */
export function addNarrative(data) {
  return request({
    url: '/glxt/chemistry/reactionNarrative',
    method: 'post',
    data: data
  })
}

/**
 * 修改反应描述
 * @param {object} data - 描述数据
 * @returns {Promise}
 */
export function updateNarrative(data) {
  return request({
    url: '/glxt/chemistry/reactionNarrative',
    method: 'put',
    data: data
  })
}

/**
 * 删除反应描述
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delNarrative(ids) {
  return request({
    url: '/glxt/chemistry/reactionNarrative/' + ids,
    method: 'delete'
  })
}

/**
 * 导出反应描述
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportNarrative(query) {
  return request({
    url: '/glxt/chemistry/reactionNarrative/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
