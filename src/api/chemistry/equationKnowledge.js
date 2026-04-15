import request from '@/utils/request'

/**
 * 查询方程式知识点列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listEquationKnowledge(query) {
  return request({
    url: '/glxt/chemistry/equationKnowledge/list',
    method: 'get',
    params: query
  })
}

/**
 * 根据方程式ID获取知识点
 * @param {number} equationId - 方程式ID
 * @returns {Promise}
 */
export function getKnowledgeByEquationId(equationId) {
  return request({
    url: '/glxt/chemistry/equationKnowledge/equation/' + equationId,
    method: 'get'
  })
}

/**
 * 保存/更新方程式知识点
 * @param {number} equationId - 方程式ID
 * @param {object} data - 知识点数据
 * @returns {Promise}
 */
export function saveEquationKnowledge(equationId, data) {
  return request({
    url: '/glxt/chemistry/equationKnowledge/equation/' + equationId,
    method: 'post',
    data: data
  })
}

/**
 * 删除方程式知识点
 * @param {number} equationId - 方程式ID
 * @returns {Promise}
 */
export function deleteEquationKnowledge(equationId) {
  return request({
    url: '/glxt/chemistry/equationKnowledge/equation/' + equationId,
    method: 'delete'
  })
}
