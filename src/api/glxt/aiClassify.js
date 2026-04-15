import request from '@/utils/request'

// 查询ai知识库分类列表
export function listAiClassify(query) {
  return request({
    url: '/glxt/aiClassify/list',
    method: 'get',
    params: query
  })
}

// 查询ai知识库分类详细
export function getAiClassify(id) {
  return request({
    url: '/glxt/aiClassify/' + id,
    method: 'get'
  })
}

// 新增ai知识库分类
export function addAiClassify(data) {
  return request({
    url: '/glxt/aiClassify',
    method: 'post',
    data: data
  })
}

// 修改ai知识库分类
export function updateAiClassify(data) {
  return request({
    url: '/glxt/aiClassify',
    method: 'put',
    data: data
  })
}

// 删除ai知识库分类
export function delAiClassify(id) {
  return request({
    url: '/glxt/aiClassify/' + id,
    method: 'delete'
  })
}
