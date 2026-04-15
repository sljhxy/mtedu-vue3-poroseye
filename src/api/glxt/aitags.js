import request from '@/utils/request'

// 查询ai标签列表
export function listAitags(query) {
  return request({
    url: '/glxt/aitags/list',
    method: 'get',
    params: query
  })
}

// 查询ai标签详细
export function getAitags(id) {
  return request({
    url: '/glxt/aitags/' + id,
    method: 'get'
  })
}

// 新增ai标签
export function addAitags(data) {
  return request({
    url: '/glxt/aitags',
    method: 'post',
    data: data
  })
}


// 批量新增ai标签
export function batchAddAitags(data) {
  return request({
    url: '/glxt/aitags/batch',
    method: 'post',
    data: data
  })
}

// 修改ai标签
export function updateAitags(data) {
  return request({
    url: '/glxt/aitags',
    method: 'put',
    data: data
  })
}

// 删除ai标签
export function delAitags(id) {
  return request({
    url: '/glxt/aitags/' + id,
    method: 'delete'
  })
}
