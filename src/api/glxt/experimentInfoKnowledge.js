import request from '@/utils/request'

// 查询实验-知识库关联列表
export function listExperimentInfoKnowledge(query) {
  return request({
    url: '/glxt/experimentInfoKnowledge/list',
    method: 'get',
    params: query
  })
}

// 查询实验-知识库关联详细
export function getExperimentInfoKnowledge(id) {
  return request({
    url: '/glxt/experimentInfoKnowledge/' + id,
    method: 'get'
  })
}

// 新增实验-知识库关联
export function addExperimentInfoKnowledge(data) {
  return request({
    url: '/glxt/experimentInfoKnowledge',
    method: 'post',
    data: data
  })
}

// 修改实验-知识库关联
export function updateExperimentInfoKnowledge(data) {
  return request({
    url: '/glxt/experimentInfoKnowledge',
    method: 'put',
    data: data
  })
}

// 删除实验-知识库关联
export function delExperimentInfoKnowledge(id) {
  return request({
    url: '/glxt/experimentInfoKnowledge/' + id,
    method: 'delete'
  })
}
