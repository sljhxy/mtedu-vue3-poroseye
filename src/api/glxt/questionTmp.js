import request from '@/utils/request'

// 查询题目列表
export function pageList(data) {
  return request({
    url: '/glxt/question/page',
    method: 'post',
    data: data
  })
}

// 编辑题目
export function edit(data) {
  return request({
    url: '/glxt/question/edit',
    method: 'post',
    data: data
  })
}

// 查询题目
export function select(id) {
  return request({
    url: '/glxt/question/select/' + id,
    method: 'post'
  })
}

// 删除题目
export function deleteQuestion(id) {
  return request({
    url: '/glxt/question/delete/' + id,
    method: 'post',
  })
}