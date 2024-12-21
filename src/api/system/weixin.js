import request from '@/utils/request'

// 查询用户列表
export function getUUid(data) {
  return request({
    url: '/system/weixin/uuid?uuid=' + data.uuid,
    method: 'get'
  })
}