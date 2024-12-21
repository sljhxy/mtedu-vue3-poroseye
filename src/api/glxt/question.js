import request from '@/utils/request'

// 查询题库 列表
export function listQuestion(query) {
  return request({
    url: '/glxt/question/list',
    method: 'get',
    params: query
  })
}

// 查询题库 详细
export function getQuestion(id) {
  return request({
    url: '/glxt/question/' + id,
    method: 'get'
  })
}

// 新增题库 
export function addQuestion(data) {
  return request({
    url: '/glxt/question',
    method: 'post',
    data: data
  })
}

// 修改题库 
export function updateQuestion(data) {
  return request({
    url: '/glxt/question',
    method: 'put',
    data: data
  })
}

// 删除题库 
export function delQuestion(id) {
  return request({
    url: '/glxt/question/' + id,
    method: 'delete'
  })
}
