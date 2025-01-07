import request from '@/utils/request'

// 查询普教-用户列表
export function listBaseUser(query) {
  return request({
    url: '/glxt/baseUser/list',
    method: 'get',
    params: query
  })
}

// 查询普教-用户详细
export function getBaseUser(id) {
  return request({
    url: '/glxt/baseUser/' + id,
    method: 'get'
  })
}

// 新增普教-用户
export function addBaseUser(data) {
  return request({
    url: '/glxt/baseUser',
    method: 'post',
    data: data
  })
}

// 修改普教-用户
export function updateBaseUser(data) {
  return request({
    url: '/glxt/baseUser',
    method: 'put',
    data: data
  })
}

// 删除普教-用户
export function delBaseUser(id) {
  return request({
    url: '/glxt/baseUser/' + id,
    method: 'delete'
  })
}


//教师 - 配置课程
export function configCourse(data) {
  return request({
    url: '/glxt/baseUser/configCourse',
    method: 'post',
    data: data
  })
}


//教师 - 修改配置课程
export function editConfigCourse(data) {
  return request({
    url: '/glxt/baseUser/editConfigCourse',
    method: 'put',
    data: data
  })
}
//教师 - 删除配置
export function deleteConfigCourse(id) {
  return request({
    url: '/glxt/baseUser/deleteConfigCourse/' + id,
    method: 'delete'
  })
}


// 教师- 查看配置课程
export function selectConfigCourseById(id) {
  return request({
    url: '/glxt/baseUser/selectConfigCourseById/' + id,
    method: 'get'
  })
}


// 获取教师配置列表
export function selectConfigCourseList(userId) {
  return request({
    url: '/glxt/baseUser/selectConfigCourseList/' + userId,
    method: 'get'
  })
}