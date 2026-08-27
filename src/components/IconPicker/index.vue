<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择图标"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
  >
    <div class="icon-picker">
      <el-input
        v-model="searchText"
        placeholder="搜索图标名称"
        prefix-icon="Search"
        clearable
        class="icon-search"
      />
      <div class="icon-grid">
        <div
          v-for="item in filteredIcons"
          :key="item.id"
          class="icon-item"
          :class="{ active: modelValue === item.id }"
          @click="handleSelect(item.id)"
          :title="item.name"
        >
          <svg class="icon-preview" aria-hidden="true">
            <use :xlink:href="'#icon-' + item.id" />
          </svg>
          <span class="icon-name">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import iconData from '@/assets/iconfont/iconfont.json'

const props = defineProps({
  modelValue: { type: String, default: '' },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const searchText = ref('')

const allIcons = iconData.glyphs.map(g => ({
  id: g.font_class,
  name: g.name
}))

const filteredIcons = computed(() => {
  if (!searchText.value) return allIcons
  const keyword = searchText.value.toLowerCase()
  return allIcons.filter(item =>
    item.id.toLowerCase().includes(keyword) ||
    item.name.toLowerCase().includes(keyword)
  )
})

function handleSelect(id) {
  emit('update:modelValue', id)
  dialogVisible.value = false
}
</script>

<style scoped>
.icon-picker {
  max-height: 500px;
  display: flex;
  flex-direction: column;
}
.icon-search {
  margin-bottom: 12px;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}
.icon-item.active {
  border-color: #409eff;
  background: #409eff;
  color: #fff;
}
.icon-preview {
  width: 28px;
  height: 28px;
  fill: currentColor;
}
.icon-item.active .icon-preview {
  fill: #fff;
}
.icon-name {
  font-size: 10px;
  margin-top: 4px;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
