import request from '@/utils/request'

// 根据学校编码解析学校信息（无需认证）
export function resolveSchoolCode(code) {
  return request({
    url: '/glxt/schoolPublic/resolve/' + code,
    headers: {
      isToken: false
    },
    method: 'get'
  })
}
