import request from '@/utils/request'

// 查询区域 列表
export function listArea(query) {
  return request({
    url: '/glxt/area/list',
    method: 'get',
    params: query
  })
}

// 查询区域 详细
export function getArea(id) {
  return request({
    url: '/glxt/area/' + id,
    method: 'get'
  })
}

// 获取区域树
export function getAreaTree(query) {
  return request({
    url: '/glxt/area/areaTree',
    method: 'get',
    params: query
  })
}

// 新增区域 
export function addArea(data) {
  return request({
    url: '/glxt/area',
    method: 'post',
    data: data
  })
}

// 修改区域 
export function updateArea(data) {
  return request({
    url: '/glxt/area',
    method: 'put',
    data: data
  })
}

// 删除区域 
export function delArea(id) {
  return request({
    url: '/glxt/area/' + id,
    method: 'delete'
  })
}
