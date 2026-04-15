import request from '@/utils/request'

/**
 * 查询实验记录列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listExperimentRun(query) {
  return request({
    url: '/glxt/chemistry/experimentRun/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询实验记录详细
 * @param {number|string} id - 记录ID
 * @returns {Promise}
 */
export function getExperimentRun(id) {
  return request({
    url: '/glxt/chemistry/experimentRun/' + id,
    method: 'get'
  })
}

/**
 * 根据用户ID查询实验记录
 * @param {number|string} userId - 用户ID
 * @returns {Promise}
 */
export function getExperimentRunByUserId(userId) {
  return request({
    url: '/glxt/chemistry/experimentRun/user/' + userId,
    method: 'get'
  })
}

/**
 * 根据模板ID查询实验记录
 * @param {number|string} templateId - 模板ID
 * @returns {Promise}
 */
export function getExperimentRunByTemplateId(templateId) {
  return request({
    url: '/glxt/chemistry/experimentRun/template/' + templateId,
    method: 'get'
  })
}

/**
 * 新增实验记录
 * @param {object} data - 记录数据
 * @returns {Promise}
 */
export function addExperimentRun(data) {
  return request({
    url: '/glxt/chemistry/experimentRun',
    method: 'post',
    data: data
  })
}

/**
 * 删除实验记录
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delExperimentRun(ids) {
  return request({
    url: '/glxt/chemistry/experimentRun/' + ids,
    method: 'delete'
  })
}

/**
 * 导出实验记录
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportExperimentRun(query) {
  return request({
    url: '/glxt/chemistry/experimentRun/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
