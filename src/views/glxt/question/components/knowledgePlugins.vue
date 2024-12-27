<template>
    <el-form-item label="知识点：" required>
            <el-tree-select
                ref="knowledgeTreeSelectRef"
                @check="handleKnowledgeChange"
                v-model="formData.knowledgePoints"
                :data="knowledgeTreeList"
                :props="{
                value: 'id',
                label: 'knowledge',
                children: 'children',
                emitPath: false
                }"
                multiple
                :render-after-expand="false"
                show-checkbox
                :check-strictly="true"
                placeholder="请选择知识点"
                clearable
                class="knowledge-select"
                collapse-tags-tooltip
                />
            </el-form-item>
            {{ formData.knowledgePoints }}
</template>

<script setup>

//获取知识点树形结构
import { getKnowledgeTree } from '@/api/glxt/knowledge';
// 使用 ref 不是 reactive 来管理表单数据
const formData = ref({
    knowledgePoints: [],//知识点
})



import { ref} from 'vue'
const knowledgeTreeSelectRef = ref(null)
const emit = defineEmits(['selectKnowledgeData'])
//知识点树形结构
const knowledgeTreeList = ref([])
const getKnowledgeTreeList = () => {
    getKnowledgeTree({}).then(response => {
    // 递归处理树形数据，确保每个节点都有正确的属性
    const processTreeData = (items) => {
        return items.map(item => ({
        id: item.id,
        knowledge: item.knowledge || item.name,
        label: item.knowledge || item.name, // 添加 label 属性
        value: item.id, // 添加 value 属性
        children: item.children ? processTreeData(item.children) : []
    }))
    }
    
    knowledgeTreeList.value = processTreeData(response.rows)
    console.log('处理后的知识点树形数据:', knowledgeTreeList.value)
    })
}

getKnowledgeTreeList()


// 生命周期钩子
onMounted(async () => {
    const id = route.query.id
    if (id && parseInt(id) !== 0) {
    formLoading.value = true
    try {
        const response = await getQuestion(id)
        const questionData = response.data
        formData.value = {
        ...questionData,
        knowledgePoints: Array.isArray(questionData.knowledgePoints) 
        ? questionData.knowledgePoints 
        : []
    }
        console.log('加载的表单数据:', formData.value)
    } catch (error) {
        console.error('加载题目数据失败:', error)
    } finally {
        formLoading.value = false
    }
}

    await getKnowledgeTreeList()
})


const handleKnowledgeChange = (data) => {
    console.log('handleKnowledgeChange',data)
    emit('selectKnowledgeData', data)
}

</script>

<style lang="scss" scoped>

</style>
