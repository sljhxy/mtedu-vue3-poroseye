import request from '@/utils/request'

// 查询普教-课程列表
export function listCourse(query) {
  return request({
    url: '/glxt/course/list',
    method: 'get',
    params: query
  })
}

// 查询普教-课程详细
export function getCourse(id, schoolId, schoolType) {
  return request({
    url: '/glxt/course/' + id + '/' + schoolId + '/' + schoolType,
    method: 'get'
  })
}

// 新增普教-课程
export function addCourse(data) {
  return request({
    url: '/glxt/course',
    method: 'post',
    data: data
  })
}

// 修改普教-课程
export function updateCourse(data) {
  return request({
    url: '/glxt/course',
    method: 'put',
    data: data
  })
}

// 删除普教-课程
export function delCourse(id) {
  return request({
    url: '/glxt/course/' + id,
    method: 'delete'
  })
}
