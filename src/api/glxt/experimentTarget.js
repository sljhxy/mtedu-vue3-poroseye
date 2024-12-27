import request from '@/utils/request'

// 查询实验-目标列表
export function listExperimentTarget(query) {
  return request({
    url: '/glxt/experimentTarget/list',
    method: 'get',
    params: query
  })
}

// 查询实验-目标详细
export function getExperimentTarget(id) {
  return request({
    url: '/glxt/experimentTarget/' + id,
    method: 'get'
  })
}

// 新增实验-目标
export function addExperimentTarget(data) {
  return request({
    url: '/glxt/experimentTarget',
    method: 'post',
    data: data
  })
}

// 修改实验-目标
export function updateExperimentTarget(data) {
  return request({
    url: '/glxt/experimentTarget',
    method: 'put',
    data: data
  })
}

// 删除实验-目标
export function delExperimentTarget(id) {
  return request({
    url: '/glxt/experimentTarget/' + id,
    method: 'delete'
  })
}
