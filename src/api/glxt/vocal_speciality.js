import request from '@/utils/request'

// 查询职教-专业列表
export function listSpeciality(query) {
  return request({
    url: '/glxt/speciality/list',
    method: 'get',
    params: query
  })
}

// 查询职教-专业详细
export function getSpeciality(id) {
  return request({
    url: '/glxt/speciality/' + id,
    method: 'get'
  })
}

// 新增职教-专业
export function addSpeciality(data) {
  return request({
    url: '/glxt/speciality',
    method: 'post',
    data: data
  })
}

// 修改职教-专业
export function updateSpeciality(data) {
  return request({
    url: '/glxt/speciality',
    method: 'put',
    data: data
  })
}

// 删除职教-专业
export function delSpeciality(id) {
  return request({
    url: '/glxt/speciality/' + id,
    method: 'delete'
  })
}


