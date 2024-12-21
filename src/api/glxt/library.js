import request from '@/utils/request'

// 查询教材版本列表
export function listLibrary(query) {
  return request({
    url: '/glxt/library/list',
    method: 'get',
    params: query
  })
}

//获取教材版本-分册列表
export function selectTextBookLibraryAndVolumeList() {
  return request({
    url: '/glxt/library/selectTextBookLibraryAndVolumeList',
    method: 'get'
  })
}

// 查询教材版本详细
export function getLibrary(id) {
  return request({
    url: '/glxt/library/' + id,
    method: 'get'
  })
}

// 新增教材版本
export function addLibrary(data) {
  return request({
    url: '/glxt/library',
    method: 'post',
    data: data
  })
}

// 修改教材版本
export function updateLibrary(data) {
  return request({
    url: '/glxt/library',
    method: 'put',
    data: data
  })
}

// 删除教材版本
export function delLibrary(id) {
  return request({
    url: '/glxt/library/' + id,
    method: 'delete'
  })
}


//根据分册id获取分册详情
export function getVolumeDetail(id) {
  return request({
    url: '/glxt/library/selectMtVolumeById/' + id,
    method: 'get'
  })
}