import request from '@/utils/request'

// 查询ai提示词列表
export function listPrompt(query) {
  return request({
    url: '/glxt/prompt/list',
    method: 'get',
    params: query
  })
}

// 查询ai提示词详细
export function getPrompt(id) {
  return request({
    url: '/glxt/prompt/' + id,
    method: 'get'
  })
}

// 新增ai提示词
export function addPrompt(data) {
  return request({
    url: '/glxt/prompt',
    method: 'post',
    data: data
  })
}


// 修改ai提示词
export function updatePrompt(data) {
  return request({
    url: '/glxt/prompt',
    method: 'put',
    data: data
  })
}

// 删除ai提示词
export function delPrompt(id) {
  return request({
    url: '/glxt/prompt/' + id,
    method: 'delete'
  })
}


//根据用户 Id 获取提示词和标签
export function selectPromptByUserId(query) {
  return request({
    url: '/glxt/prompt/selectPromptByUserId',
    method: 'get',
    params: query
  })
}
