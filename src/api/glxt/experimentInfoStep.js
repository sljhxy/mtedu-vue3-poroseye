import request from '@/utils/request'

// 查询实验-步骤列表
export function listExperimentInfoStep(query) {
  return request({
    url: '/glxt/experimentInfoStep/list',
    method: 'get',
    params: query
  })
}

// 查询实验-步骤详细
export function getExperimentInfoStep(id) {
  return request({
    url: '/glxt/experimentInfoStep/' + id,
    method: 'get'
  })
}

// 新增实验-步骤
export function addExperimentInfoStep(data) {
  return request({
    url: '/glxt/experimentInfoStep',
    method: 'post',
    data: data
  })
}

// 修改实验-步骤
export function updateExperimentInfoStep(data) {
  return request({
    url: '/glxt/experimentInfoStep',
    method: 'put',
    data: data
  })
}

// 删除实验-步骤
export function delExperimentInfoStep(id) {
  return request({
    url: '/glxt/experimentInfoStep/' + id,
    method: 'delete'
  })
}
