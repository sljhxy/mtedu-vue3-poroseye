import request from '@/utils/request'

// 查询知识点列表
export function listKnowledge(query) {
  return request({
    url: '/glxt/knowledge/list',
    method: 'get',
    params: query
  })
}

// 查询知识点详细
export function getKnowledge(id) {
  return request({
    url: '/glxt/knowledge/' + id,
    method: 'get'
  })
}

// 新增知识点
export function addKnowledge(data) {
  return request({
    url: '/glxt/knowledge',
    method: 'post',
    data: data
  })
}

// 修改知识点
export function updateKnowledge(data) {
  return request({
    url: '/glxt/knowledge',
    method: 'put',
    data: data
  })
}

// 删除知识点
export function delKnowledge(id) {
  return request({
    url: '/glxt/knowledge/' + id,
    method: 'delete'
  })
}


//组装知识库树形结构
export function getKnowledgeTree(data) {
  return request({
    url: '/glxt/knowledge/tree',
    method: 'get',
    data: data
  })
}