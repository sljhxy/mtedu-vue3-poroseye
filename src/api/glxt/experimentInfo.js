import request from '@/utils/request'

// 查询实验基本信息列表
export function listExperimentInfo(query) {
  return request({
    url: '/glxt/experimentInfo/list',
    method: 'get',
    params: query
  })
}

// 查询实验基本信息详细
export function getExperimentInfo(id) {
  return request({
    url: '/glxt/experimentInfo/' + id,
    method: 'get'
  })
}

// 新增实验基本信息
export function addExperimentInfo(data) {
  return request({
    url: '/glxt/experimentInfo',
    method: 'post',
    data: data
  })
}

// 修改实验基本信息
export function updateExperimentInfo(data) {
  return request({
    url: '/glxt/experimentInfo',
    method: 'put',
    data: data
  })
}

// 审核实验
export function toExamine(data) {
  return request({
    url: '/glxt/experimentInfo/toExamine',
    method: 'put',
    data: data
  })
}

// 提交审核
export function submitExperiment(id) {
  return request({
    url: '/glxt/experimentInfo/submit/' + id,
    method: 'put'
  })
}

// 获取实验完整数据（VO）
export function getExperimentDataVO(id) {
  return request({
    url: '/glxt/experimentInfo/getExperimentData/' + id,
    method: 'get'
  })
}

// 删除实验基本信息
export function delExperimentInfo(id) {
  return request({
    url: '/glxt/experimentInfo/' + id,
    method: 'delete'
  })
}

// 保存实验的教材章节体系关联（覆盖式：删旧+批量插新）
export function saveMountSystems(experimentInfoId, data) {
  return request({
    url: '/glxt/experimentInfo/saveMountSystems/' + experimentInfoId,
    method: 'post',
    data: data
  })
}


// 根据学校类型、学段、科目、版本、分册查询实验列表
export function listExperimentInfoMountsystem(query) {
  return request({
    url: '/glxt/experimentInfoMountsystem/list',
    method: 'get',
    params: query
  })
}

// 查询实验分册副名称列表
export function listExperimentAliases(experimentId) {
  return request({
    url: '/glxt/experimentInfo/' + experimentId + '/aliases',
    method: 'get'
  })
}

// 按唯一键查询单条实验分册副名称
export function getExperimentAlias(experimentId, subjectId, textbookLibraryId, volumeId) {
  return request({
    url: '/glxt/experimentInfo/' + experimentId + '/alias',
    method: 'get',
    params: { subjectId, textbookLibraryId, volumeId }
  })
}

// 保存/更新实验分册副名称
export function saveExperimentAlias(experimentId, data) {
  return request({
    url: '/glxt/experimentInfo/' + experimentId + '/alias',
    method: 'post',
    data: data
  })
}

// 删除实验分册副名称
export function delExperimentAlias(id) {
  return request({
    url: '/glxt/experimentInfo/alias/' + id,
    method: 'delete'
  })
}