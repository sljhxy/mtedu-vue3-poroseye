import request from '@/utils/request'

// 查询职教-学院列表
export function listCollege(query) {
  return request({
    url: '/glxt/college/list',
    method: 'get',
    params: query
  })
}

// 查询职教-学院详细
export function getCollege(id) {
  return request({
    url: '/glxt/college/' + id,
    method: 'get'
  })
}

// 新增职教-学院
export function addCollege(data) {
  return request({
    url: '/glxt/college',
    method: 'post',
    data: data
  })
}

// 修改职教-学院
export function updateCollege(data) {
  return request({
    url: '/glxt/college',
    method: 'put',
    data: data
  })
}

// 删除职教-学院
export function delCollege(id) {
  return request({
    url: '/glxt/college/' + id,
    method: 'delete'
  })
}

//判断学院是否存在
export function checkCollege(schoolId, collegeName) {
  return request({
    url: '/glxt/college/collegeExist/' + schoolId + '/' + collegeName,
    method: 'get'
  })
}