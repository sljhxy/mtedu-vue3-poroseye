import request from '@/utils/request'

// 查询题库-知识库关联列表
export function listQuestionKnowledge(query) {
  return request({
    url: '/glxt/questionKnowledge/list',
    method: 'get',
    params: query
  })
}

// 查询题库-知识库关联详细
export function getQuestionKnowledge(id) {
  return request({
    url: '/glxt/questionKnowledge/' + id,
    method: 'get'
  })
}

// 新增题库-知识库关联
export function addQuestionKnowledge(data) {
  return request({
    url: '/glxt/questionKnowledge',
    method: 'post',
    data: data
  })
}

// 修改题库-知识库关联
export function updateQuestionKnowledge(data) {
  return request({
    url: '/glxt/questionKnowledge',
    method: 'put',
    data: data
  })
}

// 删除题库-知识库关联
export function delQuestionKnowledge(id) {
  return request({
    url: '/glxt/questionKnowledge/' + id,
    method: 'delete'
  })
}
