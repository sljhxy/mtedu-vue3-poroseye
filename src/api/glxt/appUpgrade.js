import request from '@/utils/request'

// 查询APP升级管理列表
export function listAppUpgrade(query) {
  return request({
    url: '/glxt/appUpgrade/list',
    method: 'get',
    params: query
  })
}

// 查询APP升级管理详细
export function getAppUpgrade(id) {
  return request({
    url: '/glxt/appUpgrade/' + id,
    method: 'get'
  })
}

// 新增APP升级管理
export function addAppUpgrade(data) {
  return request({
    url: '/glxt/appUpgrade',
    method: 'post',
    data: data
  })
}

// 修改APP升级管理
export function updateAppUpgrade(data) {
  return request({
    url: '/glxt/appUpgrade',
    method: 'put',
    data: data
  })
}

// 删除APP升级管理
export function delAppUpgrade(ids) {
  return request({
    url: '/glxt/appUpgrade/' + ids,
    method: 'delete'
  })
}

// 发布APP升级
export function publishAppUpgrade(id) {
  return request({
    url: '/glxt/appUpgrade/publish/' + id,
    method: 'put'
  })
}

// 下架APP升级
export function offlineAppUpgrade(id) {
  return request({
    url: '/glxt/appUpgrade/offline/' + id,
    method: 'put'
  })
}

// 获取学校-设备树形数据
export function getSchoolDeviceTree() {
  return request({
    url: '/glxt/appUpgrade/schoolDeviceTree',
    method: 'get'
  })
}
