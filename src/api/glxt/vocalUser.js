import request from '@/utils/request'

// 查询职教-用户列表
export function listVocalUser(query) {
  return request({
    url: '/glxt/vocalUser/list',
    method: 'get',
    params: query
  })
}

// 查询职教-用户详细
export function getVocalUser(id) {
  return request({
    url: '/glxt/vocalUser/' + id,
    method: 'get'
  })
}

// 新增职教-用户
export function addVocalUser(data) {
  return request({
    url: '/glxt/vocalUser',
    method: 'post',
    data: data
  })
}

// 修改职教-用户
export function updateVocalUser(data) {
  return request({
    url: '/glxt/vocalUser',
    method: 'put',
    data: data
  })
}

// 删除职教-用户
export function delVocalUser(id) {
  return request({
    url: '/glxt/vocalUser/' + id,
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
export function selectVocalConfigCourseList(userId) {
  return request({
    url: '/glxt/baseUser/selectVocalConfigCourseList/' + userId,
    method: 'get'
  })
}





    /**
     * 职教添加用户 学校-学院-系-专业 下拉
     * 获取学校课程下拉框
     */
export function getSchoolOptions() {
  return request({
    url: '/glxt/vocalUser/getSchoolOption',
    method: 'get'
  })
}