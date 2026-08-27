<template>
  <!-- v-katex：容器内 LaTeX 自动渲染（$...$ 行内、$$...$$ 块级、\ce{...} 化学方程式，mhchem 扩展已全局注册） -->
  <div style="line-height:1.8" v-katex>
    <!-- 题型码与后端 QuestionTypeEnum 对齐：1单选 2多选 3判断 4填空 5简答 -->
    <!-- 单选(1)/多选(2)/判断(3)：题干 + 选项列表（判断题的选项为"是/否"，同样存在 items 里） -->
    <div v-if="qType==1 || qType==2 || qType==3" v-loading="qLoading">
      <div class="q-title" v-html="question.title"/>
      <div class="q-content">
          <span :key="item.id" v-for="item in question.items" class="q-item-contain">
            <span class="q-item-prefix">{{item.prefix}}</span>
            <span v-html="item.content" class="q-item-content"></span>
          </span>
      </div>
    </div>
    <!-- 填空(4)：题干内联（空位），每个 item 是一个空 -->
    <div v-else-if="qType==4" v-loading="qLoading">
      <div class="q-title" v-html="question.title" style="display: inline;margin-right: 10px"/>
      <span>（</span>
      <span :key="item.id" v-for="item in question.items">
        <span v-html="item.content" class="q-item-content"></span>
      </span>
      <span>）</span>
    </div>
    <!-- 简答(5)：仅题干 -->
    <div v-else-if="qType==5" v-loading="qLoading">
      <div class="q-title" v-html="question.title"/>
    </div>
    <div v-else>
    </div>
  </div>

</template>

<script setup>
const props = defineProps({
  question: {
      type: Object,
      default: function () {
        return {}
      }
    },
    qLoading: {
      type: Boolean,
      default: false
    },
    qType: {
      type: Number,
      default: 0
    }
})

</script>

<style scoped>
/* 试卷式排版：题干独立成块，选项每行一条（前缀对齐） */
.q-title {
  margin-bottom: 14px;
  font-size: 15px;
  line-height: 1.8;
  color: #303133;

  /* 收敛题干富文本自带的段落边距，防止间距翻倍 */
  :deep(p) { margin: 0 0 6px; }
  :deep(img) { max-width: 100%; }
}

.q-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.q-item-contain {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

.q-item-prefix {
  flex-shrink: 0;
  min-width: 20px;
  font-weight: 600;
  color: #409eff;
}

.q-item-content {
  min-width: 0;
  word-break: break-word;

  :deep(p) { margin: 0; display: inline; }
  :deep(img) { max-width: 100%; vertical-align: middle; }
}
</style>
