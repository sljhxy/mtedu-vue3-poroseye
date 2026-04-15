import request from '@/utils/request'

/**
 * Dashboard 统计 API
 * 对接后端 MtDashboardController (/glxt/dashboard/*)
 */

/** 获取学校列表（管理员选学校用） */
export function getDashboardSchools(schoolType) {
  return request({
    url: '/glxt/dashboard/schools',
    method: 'get',
    params: { schoolType }
  })
}

/** 获取教师班级列表 */
export function getDashboardTeacherClasses() {
  return request({
    url: '/glxt/dashboard/teacher-classes',
    method: 'get'
  })
}

/**
 * 获取总览数据
 * @param {Object} params - { schoolType, schoolId, classId }
 * @returns {Object} viewType=platform/school/class 对应不同字段
 */
export function getDashboardOverview(params) {
  return request({
    url: '/glxt/dashboard/overview',
    method: 'get',
    params
  })
}

/**
 * 获取对比柱状图数据
 * @param {Object} params - { schoolType, schoolId }
 */
export function getDashboardComparisonChart(params) {
  return request({
    url: '/glxt/dashboard/comparison-chart',
    method: 'get',
    params
  })
}

/**
 * 获取掌握度分布饼图数据
 * @param {Object} params - { schoolType, schoolId, classId }
 */
export function getDashboardDistributionChart(params) {
  return request({
    url: '/glxt/dashboard/distribution-chart',
    method: 'get',
    params
  })
}

/**
 * 获取趋势折线图数据
 * @param {Object} params - { days, schoolType, schoolId, classId }
 */
export function getDashboardTrendChart(params) {
  return request({
    url: '/glxt/dashboard/trend-chart',
    method: 'get',
    params
  })
}

/**
 * 获取Top学生排行
 * @param {Object} params - { schoolType, schoolId, classId, limit }
 */
export function getDashboardTopStudents(params) {
  return request({
    url: '/glxt/dashboard/top-students',
    method: 'get',
    params
  })
}

/**
 * 获取最近操作日志
 * @param {Number} limit - 返回条数
 */
export function getDashboardRecentOperations(limit) {
  return request({
    url: '/glxt/dashboard/recent-operations',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取最近学习动态（学生实验完成情况）
 * @param {Object} params - { schoolId, classId, limit }
 * @description 管理员可选传 schoolId，教师自动注入；classId 可选过滤班级
 */
export function getDashboardRecentExperimentActivities(params) {
  return request({
    url: '/glxt/dashboard/recent-experiment-activities',
    method: 'get',
    params
  })
}

/**
 * 获取最近N天登录趋势
 * @param {Number} days - 统计天数，默认15
 */
export function getDashboardLoginTrend(days) {
  return request({
    url: '/glxt/dashboard/login-trend',
    method: 'get',
    params: { days }
  })
}
