import request from '@/utils/request'

/**
 * 根据方程式ID保存/更新反应现象
 * @param {number} equationId - 方程式ID
 * @param {object} data - 现象数据
 * @returns {Promise}
 */
export function savePhenomena(equationId, data) {
  return request({
    url: '/glxt/chemistry/phenomena/equation/' + equationId,
    method: 'post',
    data: data
  })
}

/**
 * 根据方程式ID查询反应现象
 * @param {number} equationId - 方程式ID
 * @returns {Promise}
 */
export function getPhenomena(equationId) {
  return request({
    url: '/glxt/chemistry/phenomena/equation/' + equationId,
    method: 'get'
  })
}

/**
 * 删除指定方程式的反应现象
 * @param {number} equationId - 方程式ID
 * @returns {Promise}
 */
export function deletePhenomena(equationId) {
  return request({
    url: '/glxt/chemistry/phenomena/equation/' + equationId,
    method: 'delete'
  })
}
