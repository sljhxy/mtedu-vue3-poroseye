import request from '@/utils/request'

// 查询素材-知识库关联列表
export function listSourceMaterialKnowledge(query) {
  return request({
    url: '/glxt/sourceMaterialKnowledge/list',
    method: 'get',
    params: query
  })
}

// 查询素材-知识库关联详细
export function getSourceMaterialKnowledge(id) {
  return request({
    url: '/glxt/sourceMaterialKnowledge/' + id,
    method: 'get'
  })
}

// 新增素材-知识库关联
export function addSourceMaterialKnowledge(data) {
  return request({
    url: '/glxt/sourceMaterialKnowledge',
    method: 'post',
    data: data
  })
}

// 修改素材-知识库关联
export function updateSourceMaterialKnowledge(data) {
  return request({
    url: '/glxt/sourceMaterialKnowledge',
    method: 'put',
    data: data
  })
}

// 删除素材-知识库关联
export function delSourceMaterialKnowledge(id) {
  return request({
    url: '/glxt/sourceMaterialKnowledge/' + id,
    method: 'delete'
  })
}
