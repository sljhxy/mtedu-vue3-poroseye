
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
import { useDict } from '@/utils/dict'

const mt_school_type = useDict('mt_school_type')
const mt_vocal_education_type = useDict('mt_vocal_education_type')
const mt_academic_stage = useDict('mt_academic_stage')
const mt_school_subject = useDict('mt_school_subject')
const mt_experiment_attr_type = useDict('experiment_attr_type')
const mt_developer_type = useDict('developer_type')

//获取学段类型
const getAcademicstageName = (academicType) => {
    return mt_academic_stage.value?.find(item => item.value === academicType)?.label || ''
}
//获取学校
const getSchoolTypeName = (schoolType) => {
    return mt_school_type.value?.find(item => item.value === schoolType)?.label || ''
}
//获取开发者
const getDeveloperName = (developerType) => {
    return mt_developer_type.value?.find(item => item.value === developerType)?.label || ''
}
//获取属性类型
const getAttrName = (attrType) => {
    return mt_experiment_attr_type.value?.find(item => item.value === attrType)?.label || ''
}

// 导出所有方法
export {
    getAcademicstageName,
    getSchoolTypeName,
    getDeveloperName,
    getAttrName
}
