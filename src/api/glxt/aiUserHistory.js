import request from '@/utils/request'

// 查询ai用户历史记录列表
export function listAiUserHistory(query) {
  return request({
    url: '/glxt/aiUserHistory/list',
    method: 'get',
    params: query
  })
}

// 查询ai用户历史记录详细
export function getAiUserHistory(id) {
  return request({
    url: '/glxt/aiUserHistory/' + id,
    method: 'get'
  })
}

// 新增ai用户历史记录
export function addAiUserHistory(data) {
  return request({
    url: '/glxt/aiUserHistory',
    method: 'post',
    data: data
  })
}

// 修改ai用户历史记录
export function updateAiUserHistory(data) {
  return request({
    url: '/glxt/aiUserHistory',
    method: 'put',
    data: data
  })
}

// 删除ai用户历史记录
export function delAiUserHistory(id, aiUserSessionId) {
  return request({
    url: '/glxt/aiUserHistory/' + id + '/' + aiUserSessionId,
    method: 'delete'
  })
}
