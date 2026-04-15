import request from '@/utils/request'

// 记录日志
export function mlog(message, error = null) {
  console.log(message, error);
  return request({
    url: '/mj/log',
    method: 'post',
    data: { message, error }
  })
}