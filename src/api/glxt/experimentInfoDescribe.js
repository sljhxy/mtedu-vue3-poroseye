import request from '@/utils/request'

// 查询实验-说明列表
export function listExperimentInfoDescribe(query) {
  return request({
    url: '/glxt/experimentInfoDescribe/list',
    method: 'get',
    params: query
  })
}

// 查询实验-说明详细
export function getExperimentInfoDescribe(id) {
  return request({
    url: '/glxt/experimentInfoDescribe/' + id,
    method: 'get'
  })
}

// 新增实验-说明
export function addExperimentInfoDescribe(data) {
  return request({
    url: '/glxt/experimentInfoDescribe',
    method: 'post',
    data: data
  })
}

// 修改实验-说明
export function updateExperimentInfoDescribe(data) {
  return request({
    url: '/glxt/experimentInfoDescribe',
    method: 'put',
    data: data
  })
}

// 删除实验-说明
export function delExperimentInfoDescribe(id) {
  return request({
    url: '/glxt/experimentInfoDescribe/' + id,
    method: 'delete'
  })
}
