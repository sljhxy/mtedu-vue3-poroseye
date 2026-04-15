import request from '@/utils/request'

// 查询ai提示词自定义变量列表
export function listPromptVariable(query) {
  return request({
    url: '/glxt/promptVariable/list',
    method: 'get',
    params: query
  })
}

// 查询ai提示词自定义变量详细
export function getPromptVariable(id) {
  return request({
    url: '/glxt/promptVariable/' + id,
    method: 'get'
  })
}

// 新增ai提示词自定义变量
export function addPromptVariable(data) {
  return request({
    url: '/glxt/promptVariable',
    method: 'post',
    data: data
  })
}

// 修改ai提示词自定义变量
export function updatePromptVariable(data) {
  return request({
    url: '/glxt/promptVariable',
    method: 'put',
    data: data
  })
}

// 删除ai提示词自定义变量
export function delPromptVariable(id) {
  return request({
    url: '/glxt/promptVariable/' + id,
    method: 'delete'
  })
}
