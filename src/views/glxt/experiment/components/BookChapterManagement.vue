<template>
  <div class="book-chapter-management">
    <div class="section-header">
      <h4>教材章节体系</h4>
      <el-button type="primary" plain icon="Plus" size="small" @click="openAddDialog">添加关联</el-button>
    </div>

    <!-- 空状态 -->
    <div v-if="mountSystemList.length === 0" class="empty-tip">暂无关联，点击「添加关联」</div>

    <!-- 关联列表（标签行 + 副名称 input + 保存/删除） -->
    <div v-else class="mount-list">
      <div v-for="(item, index) in mountSystemList" :key="index" class="mount-item">
        <div class="mount-tags">
          <el-tag size="small">{{ getSubjectName(item.subjectId) }}</el-tag>
          <el-tag size="small" type="info">{{ item.textbookLibraryName || '-' }}</el-tag>
          <el-tag size="small" type="info">{{ item.volumeName || '-' }}</el-tag>
          <el-tag size="small" type="warning" v-if="item.chapterName">{{ item.chapterName }}</el-tag>
          <el-tag size="small" type="warning" v-if="item.sectionName">{{ item.sectionName }}</el-tag>
        </div>
        <div class="mount-alias">
          <el-input v-model="item.aliasName" placeholder="不填则使用实验主名称" size="small" style="width: 180px" />
          <el-button type="primary" link size="small" @click="saveAlias(index)">保存</el-button>
          <el-button type="danger" link size="small" @click="deleteItem(index)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 添加弹框（五级多选联动：科目/教材/分册/章节/小节） -->
    <el-dialog v-model="addDialogVisible" title="添加教材章节关联" width="600px" append-to-body destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="教材章节">
          <el-cascader v-model="bookSelections" :options="bookChapterTree"
            :props="{ expandTrigger: 'hover', emitPath: true, multiple: true, checkStrictly: true }"
            placeholder="选择 科目 / 教材 / 分册 / 章节 / 小节（可多选）" clearable
            collapse-tags collapse-tags-tooltip
            style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd" :disabled="!bookSelections || bookSelections.length === 0"
          :loading="saving">
          确定（{{ bookSelections?.length || 0 }} 条）
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { getBookChapterTree } from '@/api/glxt/subject'
import { getExperimentInfo, saveMountSystems } from '@/api/glxt/experimentInfo'

const { proxy } = getCurrentInstance()
const props = defineProps({
  experimentId: { type: [String, Number], default: null },
  schoolType: { type: String, default: '' },
  academicStageType: { type: String, default: '' }
})
const emit = defineEmits(['saved'])

// 字典（科目名解析）
const { mt_school_subject, mt_vocal_school_subject } = proxy.useDict('mt_school_subject', 'mt_vocal_school_subject')

// ===== 数据 =====
const mountSystemList = ref([])     // 已添加的教材章节体系列表
const bookChapterTree = ref([])     // 五级联动树
const bookSelections = ref([])      // 多选路径数组 [[subjectType, libraryId, volumeId, chapterId?, sectionId?], ...]
const addDialogVisible = ref(false)
const saving = ref(false)

// 科目名解析
const getSubjectName = (subjectId) => {
  if (!subjectId) return '-'
  const dict = props.schoolType == '1' ? mt_school_subject.value : mt_vocal_school_subject.value
  return dict?.find(d => d.value === subjectId)?.label || subjectId
}

// 加载五级联动树
const loadBookChapterTree = () => {
  if (!props.schoolType || !props.academicStageType) return
  getBookChapterTree(props.schoolType, props.academicStageType).then(res => {
    bookChapterTree.value = res.data || []
    bookChapterTree.value.forEach(item => { item.label = getSubjectName(item.value) })
  })
}

// 加载已关联的列表（从实验详情返回）
const loadMountSystems = () => {
  if (!props.experimentId) return
  getExperimentInfo(props.experimentId).then(res => {
    mountSystemList.value = (res.data.mtExperimentInfoMountSystems || []).map(ms => ({ ...ms }))
  })
}

// 从五级树按路径解析名称
const resolveNames = (path) => {
  const tree = bookChapterTree.value
  const subject = tree.find(s => s.value == path[0])
  const subjectName = subject?.label || getSubjectName(path[0])
  const lib = subject?.children?.find(l => l.value == path[1])
  const textbookLibraryName = lib?.label || ''
  const vol = lib?.children?.find(v => v.value == path[2])
  const volumeName = vol?.label || ''
  let chapterName = '', sectionName = ''
  if (path[3] && vol?.children) {
    const ch = vol.children.find(c => c.value == path[3])
    chapterName = ch?.label || ''
    if (path[4] && ch?.children) {
      const sec = ch.children.find(s => s.value == path[4])
      sectionName = sec?.label || ''
    }
  }
  return { subjectName, textbookLibraryName, volumeName, chapterName, sectionName }
}

// 打开添加弹框
const openAddDialog = () => {
  bookSelections.value = []
  addDialogVisible.value = true
}

// 确认添加（多选 → 批量加入列表 → 立刻入库）
const confirmAdd = () => {
  if (!bookSelections.value || bookSelections.value.length === 0) return
  bookSelections.value.forEach(path => {
    if (path.length < 3) return
    const names = resolveNames(path)
    mountSystemList.value.push({
      subjectId: path[0],
      textbookLibraryId: Number(path[1]),
      volumeId: Number(path[2]),
      chapterId: path[3] ? Number(path[3]) : null,
      sectionId: path[4] ? Number(path[4]) : null,
      aliasName: '',
      ...names
    })
  })
  addDialogVisible.value = false
  bookSelections.value = []
  doSave('添加成功')
}

// 保存副名称（整体覆盖式保存，每行点保存即入库）
const saveAlias = () => {
  doSave('副名称已保存')
}

// 删除（立刻生效）
const deleteItem = (index) => {
  mountSystemList.value.splice(index, 1)
  doSave('删除成功')
}

// 内部：覆盖式保存 + 刷新
const doSave = (successMsg) => {
  saving.value = true
  saveMountSystems(props.experimentId, mountSystemList.value).then(res => {
    if (res.code == 200) {
      if (successMsg) ElMessage.success(successMsg)
      emit('saved')
      loadMountSystems()
    }
    saving.value = false
  }).catch(() => { saving.value = false })
}

// 监听 schoolType + academicStageType → 重新加载五级树
watch(() => [props.schoolType, props.academicStageType], () => { loadBookChapterTree() })

onMounted(() => {
  loadBookChapterTree()
  loadMountSystems()
})
</script>

<style scoped>
.book-chapter-management {
  margin-top: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h4 {
  margin: 0; font-size: 15px; font-weight: 600; color: #303133;
}
.empty-tip {
  text-align: center; color: #909399; padding: 20px 0; font-size: 13px;
}
.mount-list {
  display: flex; flex-direction: column; gap: 10px;
}
.mount-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: #f5f7fa; border-radius: 6px;
}
.mount-tags {
  display: flex; gap: 6px; flex-wrap: wrap; flex: 1;
}
.mount-alias {
  display: flex; align-items: center; gap: 8px; margin-left: 12px;
}
</style>
