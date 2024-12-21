import request from '@/utils/request'

// 查询普教-年级列表
export function listGrade(query) {
  return request({
    url: '/glxt/grade/list',
    method: 'get',
    params: query
  })
}

// 查询普教-年级详细
export function getGrade(id) {
  return request({
    url: '/glxt/grade/' + id,
    method: 'get'
  })
}

// 新增普教-年级
export function addGrade(data) {
  return request({
    url: '/glxt/grade',
    method: 'post',
    data: data
  })
}

// 修改普教-年级
export function updateGrade(data) {
  return request({
    url: '/glxt/grade',
    method: 'put',
    data: data
  })
}

// 删除普教-年级
export function delGrade(id) {
  return request({
    url: '/glxt/grade/' + id,
    method: 'delete'
  })
}


//根据学校id和年级名称判断年级是否存在
export function checkGrade(schoolId, gradeName) {
  return request({
    url: '/glxt/grade/gradeExist/' + schoolId + '/' + gradeName,
    method: 'get'
  })
}