import request from '@/utils/request'

// 查询实验-题库列表
export function listExperimentQuestion(query) {
  return request({
    url: '/glxt/experimentQuestion/list',
    method: 'get',
    params: query
  })
}

// 查询实验-题库详细
export function getExperimentQuestion(id) {
  return request({
    url: '/glxt/experimentQuestion/' + id,
    method: 'get'
  })
}

// 新增实验-题库
export function addExperimentQuestion(data) {
  return request({
    url: '/glxt/experimentQuestion',
    method: 'post',
    data: data
  })
}

// 批量新增实验-题库
export function insertBatchMtExperimentQuestion(data) {
  return request({
    url: '/glxt/experimentQuestion/insertBatchMtExperimentQuestion',
    method: 'post',
    data: data
  })
}

// 修改实验-题库
export function updateExperimentQuestion(data) {
  return request({
    url: '/glxt/experimentQuestion',
    method: 'put',
    data: data
  })
}

// 删除实验-题库
export function delExperimentQuestion(id) {
  return request({
    url: '/glxt/experimentQuestion/' + id,
    method: 'delete'
  })
}
