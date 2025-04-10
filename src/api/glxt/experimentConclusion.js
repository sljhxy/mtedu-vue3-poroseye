import request from '@/utils/request'

// 查询实验-结论列表
export function listExperimentConclusion(query) {
  return request({
    url: '/glxt/experimentConclusion/list',
    method: 'get',
    params: query
  })
}

// 查询实验-结论详细
export function getExperimentConclusion(id) {
  return request({
    url: '/glxt/experimentConclusion/' + id,
    method: 'get'
  })
}

// 新增实验-结论
export function addExperimentConclusion(data) {
  return request({
    url: '/glxt/experimentConclusion',
    method: 'post',
    data: data
  })
}

// 修改实验-结论
export function updateExperimentConclusion(data) {
  return request({
    url: '/glxt/experimentConclusion',
    method: 'put',
    data: data
  })
}

// 删除实验-结论
export function delExperimentConclusion(id) {
  return request({
    url: '/glxt/experimentConclusion/' + id,
    method: 'delete'
  })
}
