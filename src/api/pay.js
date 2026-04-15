import request from '@/utils/request'

// 获取支付链接
export function payUrl(data) {
  return request({
    url: '/pay/url',
    method: 'post',
    data
  })
}

// 获取订单信息
export function getOrderInfo(orderId) {
  return request({
    url: `/pay/order/${orderId}`,
    method: 'get'
  })
}