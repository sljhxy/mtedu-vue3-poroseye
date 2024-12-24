import request from '@/utils/request'

// 查询题库-课程体系关联列表
export function listQuestionMountSystem(query) {
  return request({
    url: '/glxt/questionMountSystem/list',
    method: 'get',
    params: query
  })
}

// 查询题库-课程体系关联详细
export function getQuestionMountSystem(id) {
  return request({
    url: '/glxt/questionMountSystem/' + id,
    method: 'get'
  })
}

// 新增题库-课程体系关联
export function addQuestionMountSystem(data) {
  return request({
    url: '/glxt/questionMountSystem',
    method: 'post',
    data: data
  })
}

// 修改题库-课程体系关联
export function updateQuestionMountSystem(data) {
  return request({
    url: '/glxt/questionMountSystem',
    method: 'put',
    data: data
  })
}

// 删除题库-课程体系关联
export function delQuestionMountSystem(id) {
  return request({
    url: '/glxt/questionMountSystem/' + id,
    method: 'delete'
  })
}
