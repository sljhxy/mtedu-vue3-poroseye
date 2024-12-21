import request from '@/utils/request'

// 查询普教-班级 列表
export function listClass(query) {
  return request({
    url: '/glxt/class/list',
    method: 'get',
    params: query
  })
}

// 查询普教-班级 详细
export function getClass(id) {
  return request({
    url: '/glxt/class/' + id,
    method: 'get'
  })
}

// 新增普教-班级 
export function addClass(data) {
  return request({
    url: '/glxt/class',
    method: 'post',
    data: data
  })
}

// 修改普教-班级 
export function updateClass(data) {
  return request({
    url: '/glxt/class',
    method: 'put',
    data: data
  })
}

// 删除普教-班级 
export function delClass(id) {
  return request({
    url: '/glxt/class/' + id,
    method: 'delete'
  })
}


//根据年级id和班级名称判断班级是否存在
export function checkClass(gradeId, className) {
  return request({
    url: '/glxt/class/classExist/' + gradeId + '/' + className,
    method: 'get'
  })
}