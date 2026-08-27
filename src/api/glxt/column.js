import request from '@/utils/request'

// 查询栏目列表
export function listColumn(query) {
  return request({
    url: '/glxt/column/list',
    method: 'get',
    params: query
  })
}

// 查询栏目详细
export function getColumn(id) {
  return request({
    url: '/glxt/column/' + id,
    method: 'get'
  })
}

// 新增栏目
export function addColumn(data) {
  return request({
    url: '/glxt/column',
    method: 'post',
    data: data
  })
}

// 修改栏目
export function updateColumn(data) {
  return request({
    url: '/glxt/column',
    method: 'put',
    data: data
  })
}
// 修改栏目更新状态
export function changeRealTimeUpdateStatus(data) {
  return request({
    url: '/glxt/column/changeRealTimeUpdateStatus',
    method: 'put',
    data: data
  })
}

// 删除栏目
export function delColumn(id) {
  return request({
    url: '/glxt/column/' + id,
    method: 'delete'
  })
}

// ===== 学校-栏目关联（按年级管理） =====

// 按年级查栏目关联
export function listColumnsByGrade(gradeId) {
  return request({
    url: '/glxt/schoolColumn/listByGrade/' + gradeId,
    method: 'get'
  })
}

// 批量添加栏目到年级
export function batchAddColumnsToGrade(data) {
  return request({
    url: '/glxt/schoolColumn/batchAddToGrade',
    method: 'post',
    data: data
  })
}

// 批量删除栏目关联
export function delSchoolColumns(ids) {
  return request({
    url: '/glxt/schoolColumn/' + ids,
    method: 'delete'
  })
}

// 栏目排序（按年级，传入排序后的关联 id 列表）
export function reorderSchoolColumns(ids) {
  return request({
    url: '/glxt/schoolColumn/reorder',
    method: 'post',
    data: ids
  })
}
