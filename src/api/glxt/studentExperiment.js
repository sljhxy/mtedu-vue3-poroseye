import request from '@/utils/request'

// 获取学生实验详情
export function getStudentExperimentDetail(id) {
  return request({
    url: '/glxt/experiment/student/detail/' + id,
    method: 'get'
  })
}