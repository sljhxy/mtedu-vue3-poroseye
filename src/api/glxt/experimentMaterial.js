import request from '@/utils/request'

// 查询实验-素材列表
export function listExperimentMaterial(query) {
  return request({
    url: '/glxt/experimentMaterial/list',
    method: 'get',
    params: query
  })
}

// 查询实验-素材详细
export function getExperimentMaterial(id) {
  return request({
    url: '/glxt/experimentMaterial/' + id,
    method: 'get'
  })
}

// 新增实验-素材
export function addExperimentMaterial(data) {
  return request({
    url: '/glxt/experimentMaterial',
    method: 'post',
    data: data
  })
}

//批量-新增素材
export function insertBatchMtExperimentSourceMaterial(data) {
  return request({
    url: '/glxt/experimentMaterial/insertBatchMtExperimentSourceMaterial',
    method: 'post',
    data: data
  })
}

// 修改实验-素材
export function updateExperimentMaterial(data) {
  return request({
    url: '/glxt/experimentMaterial',
    method: 'put',
    data: data
  })
}

// 删除实验-素材
export function delExperimentMaterial(id) {
  return request({
    url: '/glxt/experimentMaterial/' + id,
    method: 'delete'
  })
}
