import request from '@/utils/request'

// 查询实验-知识点延伸列表
export function listExperimentKowledgeExtend(query) {
  return request({
    url: '/glxt/experimentKowledgeExtend/list',
    method: 'get',
    params: query
  })
}

// 查询实验-知识点延伸详细
export function getExperimentKowledgeExtend(id) {
  return request({
    url: '/glxt/experimentKowledgeExtend/' + id,
    method: 'get'
  })
}

// 新增实验-知识点延伸
export function addExperimentKowledgeExtend(data) {
  return request({
    url: '/glxt/experimentKowledgeExtend',
    method: 'post',
    data: data
  })
}

// 修改实验-知识点延伸
export function updateExperimentKowledgeExtend(data) {
  return request({
    url: '/glxt/experimentKowledgeExtend',
    method: 'put',
    data: data
  })
}

// 删除实验-知识点延伸
export function delExperimentKowledgeExtend(id) {
  return request({
    url: '/glxt/experimentKowledgeExtend/' + id,
    method: 'delete'
  })
}
