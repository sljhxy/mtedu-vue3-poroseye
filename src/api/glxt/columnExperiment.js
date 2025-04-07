import request from '@/utils/request'

// 查询栏目-实验关联列表
export function listColumnExperiment(query) {
  return request({
    url: '/glxt/columnExperiment/list',
    method: 'get',
    params: query
  })
}

// 查询栏目-实验关联详细
export function getColumnExperiment(id) {
  return request({
    url: '/glxt/columnExperiment/' + id,
    method: 'get'
  })
}

// 新增栏目-实验关联
export function addColumnExperiment(data) {
  return request({
    url: '/glxt/columnExperiment',
    method: 'post',
    data: data
  })
}

// 修改栏目-实验关联
export function updateColumnExperiment(data) {
  return request({
    url: '/glxt/columnExperiment',
    method: 'put',
    data: data
  })
}

// 删除栏目-实验关联
export function delColumnExperiment(id) {
  return request({
    url: '/glxt/columnExperiment/' + id,
    method: 'delete'
  })
}


// 批量新增实验
export function insertBatchMtColumnExperiment(data) {
  return request({
    url: '/glxt/columnExperiment/insertBatchMtColumnExperiment',
    method: 'post',
    data: data
  })
}


//拖拽排序
export function dragSort(data) {
  return request({
    url: '/glxt/columnExperiment/dragSort',
    method: 'post',
    data: data
  })
}
