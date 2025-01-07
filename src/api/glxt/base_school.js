import request from '@/utils/request'

// 查询普教-学校列表
export function baseListSchool(query) {
  return request({
    url: '/glxt/school/list',
    method: 'get',
    params: query
  })
}

// 查询普教-学校详细
export function getSchool(id) {
  return request({
    url: '/glxt/school/' + id,
    method: 'get'
  })
}

// 新增普教-学校
export function addSchool(data) {
  return request({
    url: '/glxt/school',
    method: 'post',
    data: data
  })
}

// 修改普教-学校
export function updateSchool(data) {
  return request({
    url: '/glxt/school',
    method: 'put',
    data: data
  })
}

// 删除普教-学校
export function delSchool(id) {
  return request({
    url: '/glxt/school/' + id,
    method: 'delete'
  })
}


//根据用户输入的学校名称转字母
export function generateLetter(schoolName) {
  return request({
    url: '/glxt/school/generateLetter/' + schoolName,
    method: 'get'
  })
}

//判断学校是否存在
export function checkSchool(schoolName) {
  return request({
    url: '/glxt/school/schoolExist/' + schoolName,
    method: 'get'
  })
}
