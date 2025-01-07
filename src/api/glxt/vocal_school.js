import request from '@/utils/request'

// 查询职教-学校列表
export function vacalListSchool(query) {
  return request({
    url: '/glxt/vocalSchool/list',
    method: 'get',
    params: query
  })
}

// 查询职教-学校详细
export function getSchool(id) {
  return request({
    url: '/glxt/vocalSchool/' + id,
    method: 'get'
  })
}

// 新增职教-学校
export function addSchool(data) {
  return request({
    url: '/glxt/vocalSchool',
    method: 'post',
    data: data
  })
}

// 修改职教-学校
export function updateSchool(data) {
  return request({
    url: '/glxt/vocalSchool',
    method: 'put',
    data: data
  })
}

// 删除职教-学校
export function delSchool(id) {
  return request({
    url: '/glxt/vocalSchool/' + id,
    method: 'delete'
  })
}

//判断学校是否存在
export function checkSchool(schoolName) {
  return request({
    url: '/glxt/vocalSchool/schoolExist/' + schoolName,
    method: 'get'
  })
}
