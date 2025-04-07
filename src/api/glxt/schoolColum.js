import request from '@/utils/request'

// 查询学校-栏目关联列表
export function listSchoolColum(query) {
  return request({
    url: '/glxt/schoolColumn/list',
    method: 'get',
    params: query
  })
}

// 查询学校-栏目关联详细
export function getSchoolColum(id) {
  return request({
    url: '/glxt/schoolColumn/' + id,
    method: 'get'
  })
}

// 新增学校-栏目关联
export function addSchoolColum(data) {
  return request({
    url: '/glxt/schoolColumn',
    method: 'post',
    data: data
  })
}

// 修改学校-栏目关联
export function updateSchoolColum(data) {
  return request({
    url: '/glxt/schoolColumn',
    method: 'put',
    data: data
  })
}

// 删除学校-栏目关联
export function delSchoolColum(id) {
  return request({
    url: '/glxt/schoolColumn/' + id,
    method: 'delete'
  })
}
