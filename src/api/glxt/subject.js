import request from '@/utils/request'

// 查询科目列表
export function listSubject(query) {
  return request({
    url: '/glxt/subject/list',
    method: 'get',
    params: query
  })
}

// 查询科目详细
export function getSubject(id, libraryId, volumeId) {
  return request({
    url: '/glxt/subject/' + id + '/' + libraryId + '/' + volumeId,
    method: 'get'
  })
}

// 新增科目
export function addSubject(data) {
  return request({
    url: '/glxt/subject',
    method: 'post',
    data: data
  })
}

// 修改科目
export function updateSubject(data) {
  return request({
    url: '/glxt/subject',
    method: 'put',
    data: data
  })
}

// 删除科目
export function delSubject(id) {
  return request({
    url: '/glxt/subject/' + id,
    method: 'delete'
  })
}


//新增，修改章节
export function addOrUpdateChapter(data) {
  return request({
    url: '/glxt/subject/addChapter',
    method: 'post',
    data: data
  })
}

// 删除章节
export function delChapter(id) {
  return request({
    url: '/glxt/subject/delChapter/' + id,
    method: 'delete'
  })
}

// 获取章节列表
export function getChapterList(volumeId) {
  return request({
    url: '/glxt/subject/chapterList/' + volumeId,
    method: 'get'
  })
}

//获取章节最大ID
export function getChapterMaxId() {
  return request({
    url: '/glxt/subject/getMaxChapterId',
    method: 'get'
  })
}


//初始化科目
export function initSubject(params) {
  return request({
    url: '/glxt/subject/initSubjectList',
    method: 'get',
    params: params
  })
}


//据学校类型、学段类型获取科目挂载课程下拉框
export function getCourseSystemOptions(schoolType, academicStage) {
  return request({
    url: '/glxt/subject/getCso/' + schoolType + '/' + academicStage,
    method: 'get'
  })
}


//判断科目是否存在
export function subjectExist(data) {
  return request({
    url: '/glxt/subject/subjectExist',
    method: 'get',
    params: data
  })
}