import request from '@/utils/request'

// 查询职教-课程列表
export function listVocalCourse(query) {
  return request({
    url: '/glxt/vocalCourse/list',
    method: 'get',
    params: query
  })
}
// 查询职教-课程详细
export function getVocalCourse(id, schoolId, schoolType) {
  return request({
    url: '/glxt/vocalCourse/' + id + '/' + schoolId + '/' + schoolType,
    method: 'get'
  })
}
// 新增职教-课程
export function addVocalCourse(data) {
  return request({
    url: '/glxt/vocalCourse',
    method: 'post',
    data: data
  })
}

// 修改职教-课程
export function updateVocalCourse(data) {
  return request({
    url: '/glxt/vocalCourse',
    method: 'put',
    data: data
  })
}

// 删除职教-课程
export function delVocalCourse(id) {
  return request({
    url: '/glxt/vocalCourse/' + id,
    method: 'delete'
  })
}
