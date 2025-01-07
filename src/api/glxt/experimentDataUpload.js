import request from '@/utils/request'

// 查询实验-数据上传列表
export function listExperimentDataUpload(query) {
  return request({
    url: '/glxt/experimentDataUpload/list',
    method: 'get',
    params: query
  })
}

// 查询实验-数据上传详细
export function getExperimentDataUpload(id) {
  return request({
    url: '/glxt/experimentDataUpload/' + id,
    method: 'get'
  })
}

// 新增实验-数据上传
export function addExperimentDataUpload(data) {
  return request({
    url: '/glxt/experimentDataUpload',
    method: 'post',
    data: data
  })
}

// 修改实验-数据上传
export function updateExperimentDataUpload(data) {
  return request({
    url: '/glxt/experimentDataUpload',
    method: 'put',
    data: data
  })
}

// 删除实验-数据上传
export function delExperimentDataUpload(id) {
  return request({
    url: '/glxt/experimentDataUpload/' + id,
    method: 'delete'
  })
}
