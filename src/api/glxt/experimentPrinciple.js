import request from '@/utils/request'

// 查询实验-原理列表
export function listExperimentPrinciple(query) {
  return request({
    url: '/glxt/experimentPrinciple/list',
    method: 'get',
    params: query
  })
}

// 查询实验-原理详细
export function getExperimentPrinciple(id) {
  return request({
    url: '/glxt/experimentPrinciple/' + id,
    method: 'get'
  })
}

// 新增实验-原理
export function addExperimentPrinciple(data) {
  return request({
    url: '/glxt/experimentPrinciple',
    method: 'post',
    data: data
  })
}

// 修改实验-原理
export function updateExperimentPrinciple(data) {
  return request({
    url: '/glxt/experimentPrinciple',
    method: 'put',
    data: data
  })
}

// 删除实验-原理
export function delExperimentPrinciple(id) {
  return request({
    url: '/glxt/experimentPrinciple/' + id,
    method: 'delete'
  })
}
