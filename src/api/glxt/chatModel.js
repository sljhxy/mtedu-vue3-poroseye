import request from '@/utils/request'

// 查询聊天模型列表
export function listMtChatModel(query) {
  return request({
    url: '/glxt/mtChatModel/list',
    method: 'get',
    params: query
  })
}

// 查询聊天模型详细
export function getMtChatModel(id) {
  return request({
    url: '/glxt/mtChatModel/' + id,
    method: 'get'
  })
}

// 新增聊天模型
export function addMtChatModel(data) {
  return request({
    url: '/glxt/mtChatModel',
    method: 'post',
    data: data
  })
}

// 修改聊天模型
export function updateMtChatModel(data) {
  return request({
    url: '/glxt/mtChatModel',
    method: 'put',
    data: data
  })
}

// 删除聊天模型
export function delMtChatModel(id) {
  return request({
    url: '/glxt/mtChatModel/' + id,
    method: 'delete'
  })
}
