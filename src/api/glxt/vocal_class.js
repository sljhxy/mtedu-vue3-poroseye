import request from '@/utils/request'

// 查询职教-班级 列表
export function listVocalClass(query) {
  return request({
    url: '/glxt/vocalClass/list',
    method: 'get',
    params: query
  })
}

// 查询职教-班级 详细
export function getVocalClass(id) {
  return request({
    url: '/glxt/vocalClass/' + id,
    method: 'get'
  })
}

// 新增职教-班级 
export function addVocalClass(data) {
  return request({
    url: '/glxt/vocalClass',
    method: 'post',
    data: data
  })
}

// 修改职教-班级 
export function updateVocalClass(data) {
  return request({
    url: '/glxt/vocalClass',
    method: 'put',
    data: data
  })
}

// 删除职教-班级 
export function delVocalClass(id) {
  return request({
    url: '/glxt/vocalClass/' + id,
    method: 'delete'
  })
}


//判断班级是否存在
export function checkVocalClass(gradeId, className) {
  return request({
    url: '/glxt/vocalClass/vocalClassExist/' + gradeId + '/' + className,
    method: 'get'
  })
}
