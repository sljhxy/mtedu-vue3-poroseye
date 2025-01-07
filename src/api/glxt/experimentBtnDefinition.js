import request from '@/utils/request'

// 查询实验-按钮定义列表
export function listExperimentBtnDefinition(query) {
  return request({
    url: '/glxt/experimentBtnDefinition/list',
    method: 'get',
    params: query
  })
}

// 查询实验-按钮定义详细
export function getExperimentBtnDefinition(id) {
  return request({
    url: '/glxt/experimentBtnDefinition/' + id,
    method: 'get'
  })
}

// 新增实验-按钮定义
export function addExperimentBtnDefinition(data) {
  return request({
    url: '/glxt/experimentBtnDefinition',
    method: 'post',
    data: data
  })
}

// 修改实验-按钮定义
export function updateExperimentBtnDefinition(data) {
  return request({
    url: '/glxt/experimentBtnDefinition',
    method: 'put',
    data: data
  })
}

// 删除实验-按钮定义
export function delExperimentBtnDefinition(id) {
  return request({
    url: '/glxt/experimentBtnDefinition/' + id,
    method: 'delete'
  })
}
