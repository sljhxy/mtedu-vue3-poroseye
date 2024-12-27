import request from '@/utils/request'

// 查询素材列表
export function listSourceMaterial(query) {
  return request({
    url: '/glxt/sourceMaterial/list',
    method: 'get',
    params: query
  })
}

// 查询素材详细
export function getSourceMaterial(id) {
  return request({
    url: '/glxt/sourceMaterial/' + id,
    method: 'get'
  })
}

// 新增素材
export function addSourceMaterial(data) {
  return request({
    url: '/glxt/sourceMaterial',
    method: 'post',
    data: data
  })
}

// 修改素材
export function updateSourceMaterial(data) {
  return request({
    url: '/glxt/sourceMaterial',
    method: 'put',
    data: data
  })
}

// 删除素材
export function delSourceMaterial(id) {
  return request({
    url: '/glxt/sourceMaterial/' + id,
    method: 'delete'
  })
}
