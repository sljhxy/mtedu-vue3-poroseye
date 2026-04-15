import request from '@/utils/request'

// 查询ai分类-文章列表
export function listaiClassifyArticle(query) {
  return request({
    url: '/glxt/aiClassifyArticle/list',
    method: 'get',
    params: query
  })
}

// 查询ai分类-文章详细
export function getaiClassifyArticle(id) {
  return request({
    url: '/glxt/aiClassifyArticle/' + id,
    method: 'get'
  })
}

// 新增ai分类-文章
export function addaiClassifyArticle(data) {
  return request({
    url: '/glxt/aiClassifyArticle',
    method: 'post',
    data: data
  })
}

// 修改ai分类-文章
export function updateaiClassifyArticle(data) {
  return request({
    url: '/glxt/aiClassifyArticle',
    method: 'put',
    data: data
  })
}

// 删除ai分类-文章
export function delaiClassifyArticle(id) {
  return request({
    url: '/glxt/aiClassifyArticle/' + id,
    method: 'delete'
  })
}
