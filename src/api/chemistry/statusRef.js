import request from '@/utils/request'

/**
 * 查询状态码关联列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listStatusRef(query) {
  return request({
    url: '/glxt/chemistry/status/ref/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询状态码关联详细
 * @param {number|string} id - 关联 ID
 * @returns {Promise}
 */
export function getStatusRef(id) {
  return request({
    url: '/glxt/chemistry/status/ref/' + id,
    method: 'get'
  })
}

/**
 * 根据业务 ID 和类型查询关联的状态码
 * @param {string} refType - 关联类型 (SUBSTANCE/EQUATION/PHENOMENON/REACTION_STAGE)
 * @param {number|string} refId - 业务 ID
 * @returns {Promise}
 */
export function getStatusRefByRef(refType, refId) {
  return request({
    url: '/glxt/chemistry/status/ref/by-ref',
    method: 'get',
    params: { refType, refId }
  })
}

/**
 * 根据状态码 ID 查询关联
 * @param {number|string} statusCodeId - 状态码 ID
 * @returns {Promise}
 */
export function listStatusRefByStatusCodeId(statusCodeId) {
  return request({
    url: '/glxt/chemistry/status/ref/by-status-code',
    method: 'get',
    params: { statusCodeId }
  })
}

/**
 * 保存状态码关联
 * @param {string} refType - 关联类型
 * @param {number|string} refId - 业务 ID
 * @param {Array} statusCodeIds - 状态码 ID 列表
 * @param {Array} statusRoles - 角色列表
 * @returns {Promise}
 */
export function saveStatusRef(refType, refId, statusCodeIds, statusRoles) {
  return request({
    url: '/glxt/chemistry/status/ref/save',
    method: 'post',
    params: { refType, refId },
    data: { statusCodeIds, statusRoles }
  })
}

/**
 * 删除状态码关联（单条）
 * @param {number|string|Array} ids - ID 或 ID 数组
 * @returns {Promise}
 */
export function delStatusRef(ids) {
  return request({
    url: '/glxt/chemistry/status/ref/' + ids,
    method: 'delete'
  })
}

/**
 * 删除状态码关联（根据业务）
 * @param {string} refType - 关联类型
 * @param {number|string} refId - 业务 ID
 * @returns {Promise}
 */
export function delStatusRefByRef(refType, refId) {
  return request({
    url: '/glxt/chemistry/status/ref/by-ref',
    method: 'delete',
    params: { refType, refId }
  })
}

/**
 * 导出状态码关联
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportStatusRef(query) {
  return request({
    url: '/glxt/chemistry/status/ref/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

/**
 * 查询量级状态码列表
 * @returns {Promise}
 */
export function listQuantityStatusCodes() {
  return request({
    url: '/glxt/chemistry/status/ref/quantity/list',
    method: 'get'
  })
}

/**
 * 查询浓度状态码列表
 * @returns {Promise}
 */
export function listConcentrationStatusCodes() {
  return request({
    url: '/glxt/chemistry/status/ref/concentration/list',
    method: 'get'
  })
}

/**
 * 查询程度状态码列表
 * @returns {Promise}
 */
export function listDegreeStatusCodes() {
  return request({
    url: '/glxt/chemistry/status/ref/degree/list',
    method: 'get'
  })
}
