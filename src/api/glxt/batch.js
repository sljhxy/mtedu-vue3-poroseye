import request from '@/utils/request'

// 查询批次列表
export function listBatch(query) {
  return request({
    url: '/glxt/batch/list',
    method: 'get',
    params: query
  })
}

// 查询批次详细
export function getBatch(id) {
  return request({
    url: '/glxt/batch/' + id,
    method: 'get'
  })
}

// 新增批次
export function addBatch(data) {
  return request({
    url: '/glxt/batch',
    method: 'post',
    data: data
  })
}

// 修改批次
export function updateBatch(data) {
  return request({
    url: '/glxt/batch',
    method: 'put',
    data: data
  })
}

// 删除批次
export function delBatch(id) {
  return request({
    url: '/glxt/batch/' + id,
    method: 'delete'
  })
}
