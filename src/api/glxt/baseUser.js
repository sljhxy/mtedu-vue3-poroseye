import request from '@/utils/request'

// 查询普教-用户列表
export function listBaseUser(query) {
  return request({
    url: '/glxt/baseUser/list',
    method: 'get',
    params: query
  })
}

// 查询普教-用户详细
export function getBaseUser(id) {
  return request({
    url: '/glxt/baseUser/' + id,
    method: 'get'
  })
}

// 新增普教-用户
export function addBaseUser(data) {
  return request({
    url: '/glxt/baseUser',
    method: 'post',
    data: data
  })
}

// 修改普教-用户
export function updateBaseUser(data) {
  return request({
    url: '/glxt/baseUser',
    method: 'put',
    data: data
  })
}

// 删除普教-用户
export function delBaseUser(id) {
  return request({
    url: '/glxt/baseUser/' + id,
    method: 'delete'
  })
}
