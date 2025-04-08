<template>
    
<el-form-item label="类型：" prop="schoolType" >
    <el-select 
            v-model="formData.schoolType" 
            placeholder="请选择学校类型"
            class="fixed-width-select"
            @change="schoolTypeChange"
            clearable
            >
                <el-option 
                    v-for="item in mt_school_type" 
                    :key="item.value" 
                    :value="item.value" 
                    :label="item.label"
                ></el-option>
            </el-select>
            </el-form-item>
            <el-form-item label="学段：" prop="academicStageType" >
                <el-select 
                    v-model="formData.academicStageType" 
                    placeholder="请选择学段"
                    class="fixed-width-select"
                    @change="academicStageChange"
                    clearable
                >
                <el-option 
                    v-for="item in formData.schoolType=='1'?mt_academic_stage:mt_vocal_education_type" 
                    :key="item.value" 
                    :value="item.value" 
                    :label="item.label"
                ></el-option>
            </el-select>
            </el-form-item>
            <el-form-item label="科目-教材体系：" prop="courseSystems">
                <el-cascader
                    style="width: 300px;"
                    v-model="formData.courseSystems"
                    :options="courseSystemOptions"
                    :props="{ 
                        expandTrigger: 'hover',
                        multiple: false,
                        emitPath: true
                    }"
                    placeholder="请选择课程体系"
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                    class="w-full"
                    @change="handleCourseSystemChange"
                    
                />
                <!-- {{formData.courseSystems}} -->
            </el-form-item>
        
</template>

<script setup>
const { proxy } = getCurrentInstance();
//字典引入 学校类型、  mt_vocal_education_type->职教学段、mt_academic_stage->普教学段、 学制
const { mt_school_type, mt_vocal_education_type, mt_academic_stage, mt_school_subject,mt_vocal_school_subject} = proxy.useDict('mt_school_type', 'mt_vocal_education_type', 'mt_academic_stage', 'mt_school_subject','mt_vocal_school_subject');

import {getCourseSystemOptions } from '@/api/glxt/subject'

const emit = defineEmits(['selectData'])

const props = defineProps({
    initialData: {
        type: Object,
        default: () => ({
            schoolType: '',
            academicStageType: '',
            courseSystems: [[]]
        })
    }
})

const formData = ref({
    schoolType: '',//学校类型 1-普教  2-职教
    academicStageType: '',//学段
    courseSystems: [[]],//挂载课程
})


//获取科目名称
const getSubjectName = (schoolType, subjectType) => {
    return schoolType=='1' ? 
    mt_school_subject.value ?.find(item => item.value === subjectType).label : 
    mt_vocal_school_subject.value ?.find(item => item.value === subjectType).label
}

//学段
const educationStage = ref([])

//学校类型改变时，学段改变
const schoolTypeChange = (value) => {
  //清空学段、科目教材体系的数据
    formData.value.courseSystems = [[]]
    formData.value.academicStageType = ''
    // if(value == 1){
    //     educationStage.value = mt_academic_stage
    // }else{
    //     educationStage.value = mt_vocal_education_type
    // }
}

const academicStageChange = (value) => {
    getCourseSystemOptionList(formData.value.schoolType, value)
}

const courseSystemOptions = ref([])//获取挂载课程
const getCourseSystemOptionList = (schoolType, academicStage) => {

    getCourseSystemOptions(schoolType, academicStage).then(response => {
        courseSystemOptions.value = response.data
        // console.log(courseSystemOptions.value)
        courseSystemOptions.value.forEach(item => {
        item.label = getSubjectName(schoolType,item.value);
        })
    })
}



const handleCourseSystemChange = (values) => {

    emit('selectData', formData.value)
// 挂载课程系统
    if (!values || values.length === 0) {
    formData.value.courseSystems = []
    return
    }

}

// Watch initialData and set form values when it changes
watch(() => props.initialData, (newVal) => {
    if (newVal) {
        formData.value = {
        schoolType: newVal.schoolType,
        academicStageType: newVal.academicStageType,
        courseSystems: newVal.courseSystems
    }
        // Trigger the necessary cascading updates
        if (newVal.schoolType) {
            // schoolTypeChange(newVal.schoolType)
            if (newVal.academicStageType) {
                getCourseSystemOptionList(newVal.schoolType, newVal.academicStageType)
            }
        }
    }
}, { immediate: true })

</script>

<style lang="scss" scoped>
.fixed-width-select {
    width: 240px;  
}

.form-item {
    :deep(.el-form-item__label) {
        width: 1120px;  // 调整标签宽度
        text-align: right;
        margin-right: 12px;  // 添加一些右边距
    }
}
</style>

