import request from '@/utils/request'

// 查询题库JSON列表
export function listContent(query) {
  return request({
    url: '/glxt/content/list',
    method: 'get',
    params: query
  })
}

// 查询题库JSON详细
export function getContent(id) {
  return request({
    url: '/glxt/content/' + id,
    method: 'get'
  })
}

// 新增题库JSON
export function addContent(data) {
  return request({
    url: '/glxt/content',
    method: 'post',
    data: data
  })
}

// 修改题库JSON
export function updateContent(data) {
  return request({
    url: '/glxt/content',
    method: 'put',
    data: data
  })
}

// 删除题库JSON
export function delContent(id) {
  return request({
    url: '/glxt/content/' + id,
    method: 'delete'
  })
}
