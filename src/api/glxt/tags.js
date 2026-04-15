import request from '@/utils/request'

// 查询ai提示词标签列表
export function listTags(query) {
  return request({
    url: '/glxt/tags/list',
    method: 'get',
    params: query
  })
}

// 查询ai提示词标签详细
export function getTags(id) {
  return request({
    url: '/glxt/tags/' + id,
    method: 'get'
  })
}

// 新增ai提示词标签
export function addTags(data) {
  return request({
    url: '/glxt/tags',
    method: 'post',
    data: data
  })
}

// 修改ai提示词标签
export function updateTags(data) {
  return request({
    url: '/glxt/tags',
    method: 'put',
    data: data
  })
}

// 删除ai提示词标签
export function delTags(id) {
  return request({
    url: '/glxt/tags/' + id,
    method: 'delete'
  })
}
