import request from '@/utils/request'

/**
 * 查询实验模板列表
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function listTemplate(query) {
  return request({
    url: '/glxt/chemistry/template/list',
    method: 'get',
    params: query
  })
}

/**
 * 查询实验模板详细
 * @param {number|string} id - 模板ID
 * @returns {Promise}
 */
export function getTemplate(id) {
  return request({
    url: '/glxt/chemistry/template/' + id,
    method: 'get'
  })
}

/**
 * 根据实验代码查询模板
 * @param {string} experimentCode - 实验代码
 * @returns {Promise}
 */
export function getTemplateByCode(experimentCode) {
  return request({
    url: '/glxt/chemistry/template/code/' + experimentCode,
    method: 'get'
  })
}

/**
 * 根据难度查询模板
 * @param {string} difficultyLevel - 难度等级
 * @returns {Promise}
 */
export function getTemplateByDifficulty(difficultyLevel) {
  return request({
    url: '/glxt/chemistry/template/difficulty/' + difficultyLevel,
    method: 'get'
  })
}

/**
 * 根据科目查询模板
 * @param {string} subject - 科目
 * @returns {Promise}
 */
export function getTemplateBySubject(subject) {
  return request({
    url: '/glxt/chemistry/template/subject/' + subject,
    method: 'get'
  })
}

/**
 * 获取已发布的模板列表
 * @returns {Promise}
 */
export function getPublishedTemplates() {
  return request({
    url: '/glxt/chemistry/template/published',
    method: 'get'
  })
}

/**
 * 新增实验模板
 * @param {object} data - 模板数据
 * @returns {Promise}
 */
export function addTemplate(data) {
  return request({
    url: '/glxt/chemistry/template',
    method: 'post',
    data: data
  })
}

/**
 * 修改实验模板
 * @param {object} data - 模板数据
 * @returns {Promise}
 */
export function updateTemplate(data) {
  return request({
    url: '/glxt/chemistry/template',
    method: 'put',
    data: data
  })
}

/**
 * 删除实验模板
 * @param {number|string|Array} ids - ID或ID数组
 * @returns {Promise}
 */
export function delTemplate(ids) {
  return request({
    url: '/glxt/chemistry/template/' + ids,
    method: 'delete'
  })
}

/**
 * 导出实验模板
 * @param {object} query - 查询参数
 * @returns {Promise}
 */
export function exportTemplate(query) {
  return request({
    url: '/glxt/chemistry/template/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}
