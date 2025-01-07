import request from '@/utils/request'

// 查询职教-用户列表
export function listVocalUser(query) {
  return request({
    url: '/glxt/vocalUser/list',
    method: 'get',
    params: query
  })
}

// 查询职教-用户详细
export function getVocalUser(id) {
  return request({
    url: '/glxt/vocalUser/' + id,
    method: 'get'
  })
}

// 新增职教-用户
export function addVocalUser(data) {
  return request({
    url: '/glxt/vocalUser',
    method: 'post',
    data: data
  })
}

// 修改职教-用户
export function updateVocalUser(data) {
  return request({
    url: '/glxt/vocalUser',
    method: 'put',
    data: data
  })
}

// 删除职教-用户
export function delVocalUser(id) {
  return request({
    url: '/glxt/vocalUser/' + id,
    method: 'delete'
  })
}
