import request from '@/utils/request'

// 查询职教-院系列表
export function listSystem(query) {
  return request({
    url: '/glxt/system/list',
    method: 'get',
    params: query
  })
}

// 查询职教-院系详细
export function getSystem(id) {
  return request({
    url: '/glxt/system/' + id,
    method: 'get'
  })
}

// 新增职教-院系
export function addSystem(data) {
  return request({
    url: '/glxt/system',
    method: 'post',
    data: data
  })
}

// 修改职教-院系
export function updateSystem(data) {
  return request({
    url: '/glxt/system',
    method: 'put',
    data: data
  })
}

// 删除职教-院系
export function delSystem(id) {
  return request({
    url: '/glxt/system/' + id,
    method: 'delete'
  })
}


//判断系统是否存在
export function checkSystem(schoolId, systemName) {
  return request({
    url: '/glxt/system/systemExist/' + schoolId + '/' + systemName,
    method: 'get'
  })
}