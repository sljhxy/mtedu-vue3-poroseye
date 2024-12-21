import request from '@/utils/request'

// 查询职教-年级列表
export function listVocalGrade(query) {
  return request({
    url: '/glxt/vocalGrade/list',
    method: 'get',
    params: query
  })
}

// 查询职教-年级详细
export function getVocalGrade(id) {
  return request({
    url: '/glxt/vocalGrade/' + id,
    method: 'get'
  })
}

// 新增职教-年级
export function addVocalGrade(data) {
  return request({
    url: '/glxt/vocalGrade',
    method: 'post',
    data: data
  })
}

// 修改职教-年级
export function updateVocalGrade(data) {
  return request({
    url: '/glxt/vocalGrade',
    method: 'put',
    data: data
  })
}

// 删除职教-年级
export function delVocalGrade(id) {
  return request({
    url: '/glxt/vocalGrade/' + id,
    method: 'delete'
  })
}

//判断年级是否存在
export function checkVocalGrade(specialId, gradeName) {
  return request({
    url: '/glxt/vocalGrade/vocalGradeExist/' + specialId + '/' + gradeName,
    method: 'get'
  })
}