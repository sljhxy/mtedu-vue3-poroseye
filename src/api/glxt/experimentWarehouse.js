import request from '@/utils/request'

// 查询实验-器具列表
export function listExperimentWarehouse(query) {
  return request({
    url: '/glxt/experimentWarehouse/list',
    method: 'get',
    params: query
  })
}

// 查询实验-器具详细
export function getExperimentWarehouse(id) {
  return request({
    url: '/glxt/experimentWarehouse/' + id,
    method: 'get'
  })
}

// 新增实验-器具
export function addExperimentWarehouse(data) {
  return request({
    url: '/glxt/experimentWarehouse',
    method: 'post',
    data: data
  })
}

// 修改实验-器具
export function updateExperimentWarehouse(data) {
  return request({
    url: '/glxt/experimentWarehouse',
    method: 'put',
    data: data
  })
}

// 删除实验-器具
export function delExperimentWarehouse(id) {
  return request({
    url: '/glxt/experimentWarehouse/' + id,
    method: 'delete'
  })
}
