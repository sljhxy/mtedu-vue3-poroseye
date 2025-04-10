import request from '@/utils/request'

// 查询实验-评价维度列表
export function listExperimentEvaluationDimension(query) {
  return request({
    url: '/glxt/experimentEvaluationDimension/list',
    method: 'get',
    params: query
  })
}

// 查询实验-评价维度详细
export function getExperimentEvaluationDimension(id) {
  return request({
    url: '/glxt/experimentEvaluationDimension/' + id,
    method: 'get'
  })
}

// 新增实验-评价维度
export function addExperimentEvaluationDimension(data) {
  return request({
    url: '/glxt/experimentEvaluationDimension',
    method: 'post',
    data: data
  })
}

// 修改实验-评价维度
export function updateExperimentEvaluationDimension(data) {
  return request({
    url: '/glxt/experimentEvaluationDimension',
    method: 'put',
    data: data
  })
}

// 删除实验-评价维度
export function delExperimentEvaluationDimension(id) {
  return request({
    url: '/glxt/experimentEvaluationDimension/' + id,
    method: 'delete'
  })
}
