import request from '@/utils/request'

// 查询文件上传测试列表
export function listFileTest(query) {
  return request({
    url: '/glxt/fileTest/list',
    method: 'get',
    params: query
  })
}

// 查询文件上传测试详细
export function getFileTest(id) {
  return request({
    url: '/glxt/fileTest/' + id,
    method: 'get'
  })
}

// 新增文件上传测试
export function addFileTest(data) {
  return request({
    url: '/glxt/fileTest',
    method: 'post',
    data: data
  })
}

// 修改文件上传测试
export function updateFileTest(data) {
  return request({
    url: '/glxt/fileTest',
    method: 'put',
    data: data
  })
}

// 删除文件上传测试
export function delFileTest(id) {
  return request({
    url: '/glxt/fileTest/' + id,
    method: 'delete'
  })
}
