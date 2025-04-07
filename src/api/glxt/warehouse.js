import request from '@/utils/request'

// 查询实验器具列表
export function listWarehouse(query) {
  return request({
    url: '/glxt/warehouse/list',
    method: 'get',
    headers: { 'login_type': 'web_user' },
    params: query
  })
}

// 查询实验器具详细
export function getWarehouse(id) {
  return request({
    url: '/glxt/warehouse/' + id,
    method: 'get'
  })
}

// 新增实验器具
export function addWarehouse(data) {
  return request({
    url: '/glxt/warehouse',
    method: 'post',
    data: data
  })
}

// 修改实验器具
export function updateWarehouse(data) {
  return request({
    url: '/glxt/warehouse',
    method: 'put',
    data: data
  })
}

// 删除实验器具
export function delWarehouse(id) {
  return request({
    url: '/glxt/warehouse/' + id,
    method: 'delete'
  })
}
