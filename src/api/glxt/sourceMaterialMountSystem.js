import request from '@/utils/request'

// 查询素材-课程体系关联列表
export function listSourceMaterialMountSystem(query) {
  return request({
    url: '/glxt/sourceMaterialMountSystem/list',
    method: 'get',
    params: query
  })
}

// 查询素材-课程体系关联详细
export function getSourceMaterialMountSystem(id) {
  return request({
    url: '/glxt/sourceMaterialMountSystem/' + id,
    method: 'get'
  })
}

// 新增素材-课程体系关联
export function addSourceMaterialMountSystem(data) {
  return request({
    url: '/glxt/sourceMaterialMountSystem',
    method: 'post',
    data: data
  })
}

// 修改素材-课程体系关联
export function updateSourceMaterialMountSystem(data) {
  return request({
    url: '/glxt/sourceMaterialMountSystem',
    method: 'put',
    data: data
  })
}

// 删除素材-课程体系关联
export function delSourceMaterialMountSystem(id) {
  return request({
    url: '/glxt/sourceMaterialMountSystem/' + id,
    method: 'delete'
  })
}
