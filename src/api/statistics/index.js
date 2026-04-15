import request from '@/utils/request'

// 获取学校下的年级列表
export function getGrades(data) {
  return request({
    url: '/glxt/experiment/statistics/grades',
    method: 'post',
    data: data
  })
}

// 获取教师下的年级列表
export function getTeacherGrades(teacherId) {
  return request({
    url: '/glxt/experiment/statistics/teacher/grades',
    method: 'get',
    params: { teacherId }
  })
}

// 获取年级下的班级列表
export function getClasses(data) {
  return request({
    url: '/glxt/experiment/statistics/classes',
    method: 'post',
    data: data
  })
}

// 获取班级统计数据
export function getClassStatistics(classId, experimentId) {
  return request({
    url: '/glxt/experiment/statistics/class',
    method: 'get',
    params: { classId, experimentId }
  })
}

// 获取学生实验掌握度（支持筛选）
// query: { userId, schoolType, experimentId, startTime, endTime }
export function getStudentExperiments(query) {
  return request({
    url: '/glxt/experiment/statistics/student',
    method: 'post',
    data: query
  })
}

// 获取班级统计数据（支持筛选）
export function getClassStatisticsByFilter(data) {
  return request({
    url: '/glxt/experiment/statistics/class/filter',
    method: 'post',
    data: data
  })
}

// 获取科目列表
export function getSubjectList(params) {
  return request({
    url: '/glxt/subject/initSubjectList',
    method: 'get',
    params: params || {}
  })
}

// 获取实验列表
export function getExperimentList(params) {
  return request({
    url: '/glxt/experimentInfo/list',
    method: 'get',
    params: params
  })
}

/**
 * 获取内容操作统计数据（整体正确率 + 步骤正确率/错误率TOP10）
 * @param {Object} data - 查询参数 { schoolId, schoolType, classId, experimentId, startTime, endTime, etc }
 */
export function getContentOperationStatistics(data) {
  return request({
    url: '/glxt/experiment/statistics/content/analysis',
    method: 'post',
    data: data
  })
}

/**
 * 获取内容操作学生列表
 * @param {Object} data - 查询参数（含分页）{ schoolId, schoolType, classId, experimentId, pageNum, pageSize, etc }
 */
export function getContentOperationStudents(data) {
  return request({
    url: '/glxt/experiment/statistics/content/students',
    method: 'post',
    data: data
  })
}
