
import request from '@/utils/request'

// 查询ai用户会话记录列表
export function listSession(query) {
  return request({
    url: '/glxt/session/list',
    method: 'get',
    params: query
  })
}

// 查询ai用户会话记录详细
export function getSession(id) {
  return request({
    url: '/glxt/session/' + id,
    method: 'get'
  })
}

// 新增ai用户会话记录
export function addSession(data) {
  return request({
    url: '/glxt/session',
    method: 'post',
    data: data
  })
}

// 修改ai用户会话记录
export function updateSession(data) {
  return request({
    url: '/glxt/session',
    method: 'put',
    data: data
  })
}

// 删除ai用户会话记录
export function delSession(id) {
  return request({
    url: '/glxt/session/' + id,
    method: 'delete'
  })
}
