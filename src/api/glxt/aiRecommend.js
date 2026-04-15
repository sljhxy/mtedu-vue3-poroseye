import request from '@/utils/request'

// 查询ai推荐标签列表
export function listAiRecommend(query) {
  return request({
    url: '/glxt/aiRecommend/list',
    method: 'get',
    params: query
  })
}

// 查询ai推荐标签详细
export function getAiRecommend(id) {
  return request({
    url: '/glxt/aiRecommend/' + id,
    method: 'get'
  })
}

// 新增ai推荐标签
export function addAiRecommend(data) {
  return request({
    url: '/glxt/aiRecommend',
    method: 'post',
    data: data
  })
}

// 修改ai推荐标签
export function updateAiRecommend(data) {
  return request({
    url: '/glxt/aiRecommend',
    method: 'put',
    data: data
  })
}

// 删除ai推荐标签
export function delAiRecommend(id) {
  return request({
    url: '/glxt/aiRecommend/' + id,
    method: 'delete'
  })
}
