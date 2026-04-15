import { computed } from 'vue'
import useUserStore from './user'

/**
 * 教师用户信息 composable
 * 自动判断当前用户是否教师，提供 schoolType/schoolId
 * 教师用户：自动填充，禁用选择器
 * 管理员用户：返回空，不影响原有逻辑
 */
export function useTeacherInfo() {
  const userStore = useUserStore()

  /** 是否教师用户 */
  const isTeacher = computed(() => !!userStore.schoolType)

  /** 学校类型（1=普教, 2=职教） */
  const schoolType = computed(() => userStore.schoolType)

  /** 所属学校ID */
  const schoolId = computed(() => userStore.schoolId)

  return { isTeacher, schoolType, schoolId }
}
