import request from '@/utils/request'

// 查询ai分类-知识库列表
export function listaiClassifyKnowledge(query) {
  return request({
    url: '/glxt/aiClassifyKnowledge/list',
    method: 'get',
    params: query
  })
}

// 查询ai分类-知识库详细
export function getaiClassifyKnowledge(id) {
  return request({
    url: '/glxt/aiClassifyKnowledge/' + id,
    method: 'get'
  })
}

// 新增ai分类-知识库
export function addaiClassifyKnowledge(data) {
  return request({
    url: '/glxt/aiClassifyKnowledge',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

// 修改ai分类-知识库
export function updateaiClassifyKnowledge(data) {
  return request({
    url: '/glxt/aiClassifyKnowledge',
    method: 'put',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

// 删除ai分类-知识库
export function delaiClassifyKnowledge(id) {
  return request({
    url: '/glxt/aiClassifyKnowledge/' + id,
    method: 'delete'
  })
}
