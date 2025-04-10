import request from '@/utils/request'

// 查询实验-评价要求列表
export function listExperimentRequirements(query) {
  return request({
    url: '/glxt/experimentRequirements/list',
    method: 'get',
    params: query
  })
}

// 查询实验-评价要求详细
export function getExperimentRequirements(id) {
  return request({
    url: '/glxt/experimentRequirements/' + id,
    method: 'get'
  })
}

// 新增实验-评价要求
export function addExperimentRequirements(data) {
  return request({
    url: '/glxt/experimentRequirements',
    method: 'post',
    data: data
  })
}

// 修改实验-评价要求
export function updateExperimentRequirements(data) {
  return request({
    url: '/glxt/experimentRequirements',
    method: 'put',
    data: data
  })
}

// 删除实验-评价要求
export function delExperimentRequirements(id) {
  return request({
    url: '/glxt/experimentRequirements/' + id,
    method: 'delete'
  })
}
