import request from '@/utils/request'

// 查询实验-步骤-关联操作列表
export function listExperimentStepRelevance(query) {
  return request({
    url: '/glxt/experimentStepRelevance/list',
    method: 'get',
    params: query
  })
}

// 查询实验-步骤-关联操作详细
export function getExperimentStepRelevance(id) {
  return request({
    url: '/glxt/experimentStepRelevance/' + id,
    method: 'get'
  })
}

// 新增实验-步骤-关联操作
export function addExperimentStepRelevance(data) {
  return request({
    url: '/glxt/experimentStepRelevance',
    method: 'post',
    data: data
  })
}

// 修改实验-步骤-关联操作
export function updateExperimentStepRelevance(data) {
  return request({
    url: '/glxt/experimentStepRelevance',
    method: 'put',
    data: data
  })
}

// 删除实验-步骤-关联操作
export function delExperimentStepRelevance(id) {
  return request({
    url: '/glxt/experimentStepRelevance/' + id,
    method: 'delete'
  })
}
