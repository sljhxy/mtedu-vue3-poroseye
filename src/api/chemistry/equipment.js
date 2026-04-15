import request from '@/utils/request'

/**
 * 查询实验器材列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listEquipment(query) {
  return request({
    url: '/glxt/chemistry/equipment/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询实验器材详细
 * @param {number|string} id - 器材ID
 * @returns {Promise}
 */
export function getEquipment(id) {
  return request({
    url: '/glxt/chemistry/equipment/' + id,
    method: 'get'
  })
}

/**
 * 根据编码查询器材
 * @param {string} code - 器材编码
 * @returns {Promise}
 */
export function getEquipmentByCode(code) {
  return request({
    url: '/glxt/chemistry/equipment/code/' + code,
    method: 'get'
  })
}

/**
 * 根据类别查询器材
 * @param {string} category - 器材类别
 * @returns {Promise}
 */
export function getEquipmentByCategory(category) {
  return request({
    url: '/glxt/chemistry/equipment/category/' + category,
    method: 'get'
  })
}

/**
 * 新增实验器材
 * @param {object} data - 器材数据
 * @returns {Promise}
 */
export function addEquipment(data) {
  return request({
    url: '/glxt/chemistry/equipment',
    method: 'post',
    data: data
  })
}

/**
 * 修改实验器材
 * @param {object} data - 器材数据
 * @returns {Promise}
 */
export function updateEquipment(data) {
  return request({
    url: '/glxt/chemistry/equipment',
    method: 'put',
    data: data
  })
}

/**
 * 删除实验器材
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delEquipment(ids) {
  return request({
    url: '/glxt/chemistry/equipment/' + ids,
    method: 'delete'
  })
}

/**
 * 导出实验器材
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportEquipment(query) {
  return request({
    url: '/glxt/chemistry/equipment/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
