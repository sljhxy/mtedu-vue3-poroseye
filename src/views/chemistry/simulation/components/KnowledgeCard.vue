<template>
  <div class="knowledge-card">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Reading /></el-icon>
            知识点学习
          </span>
        </div>
      </template>

      <div v-if="!knowledge || (knowledge.preExperiment && knowledge.preExperiment.length === 0 && !knowledge.principle && !knowledge.further)" class="empty-state">
        <el-empty description="暂无知识点数据" :image-size="80" />
      </div>

      <div v-else class="knowledge-content">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 实验前必读 -->
          <el-tab-pane name="pre-experiment">
            <template #label>
              <span class="tab-label">
                <el-icon><WarningFilled /></el-icon>
                实验前必读
              </span>
            </template>
            <div class="tab-content">
              <div v-if="knowledge.preExperiment && knowledge.preExperiment.length > 0" class="pre-experiment-list">
                <div
                  v-for="(item, index) in knowledge.preExperiment"
                  :key="index"
                  class="pre-experiment-item"
                  :class="'type-' + item.type"
                >
                  <div class="item-header">
                    <el-icon :color="getPreExperimentIconColor(item.type)">
                      <component :is="getPreExperimentIcon(item.type)" />
                    </el-icon>
                    <span class="item-title">{{ item.title }}</span>
                  </div>
                  <div class="item-content">{{ item.content }}</div>
                </div>
              </div>
              <el-empty v-else description="暂无实验前必读内容" />
            </div>
          </el-tab-pane>

          <!-- 反应原理 -->
          <el-tab-pane name="principle">
            <template #label>
              <span class="tab-label">
                <el-icon><Document /></el-icon>
                反应原理
              </span>
            </template>
            <div class="tab-content">
              <div v-if="knowledge.principle" class="principle-content">
                <div v-if="knowledge.principle.mechanism" class="principle-section">
                  <h4 class="section-title">反应机理</h4>
                  <div class="section-content" v-html="knowledge.principle.mechanism"></div>
                </div>

                <div v-if="knowledge.principle.thermodynamics" class="principle-section">
                  <h4 class="section-title">热力学分析</h4>
                  <div class="section-content" v-html="knowledge.principle.thermodynamics"></div>
                </div>

                <div v-if="knowledge.principle.kinetics" class="principle-section">
                  <h4 class="section-title">动力学分析</h4>
                  <div class="section-content" v-html="knowledge.principle.kinetics"></div>
                </div>

                <div v-if="knowledge.principle.application" class="principle-section">
                  <h4 class="section-title">实际应用</h4>
                  <div class="section-content" v-html="knowledge.principle.application"></div>
                </div>
              </div>
              <el-empty v-else description="暂无反应原理内容" />
            </div>
          </el-tab-pane>

          <!-- 深入学习 -->
          <el-tab-pane name="further">
            <template #label>
              <span class="tab-label">
                <el-icon><Compass /></el-icon>
                深入学习
              </span>
            </template>
            <div class="tab-content">
              <div v-if="knowledge.further" class="further-content">
                <div v-if="knowledge.further.relatedConcepts && knowledge.further.relatedConcepts.length > 0" class="further-section">
                  <h4 class="section-title">相关概念</h4>
                  <div class="concept-list">
                    <el-tag
                      v-for="concept in knowledge.further.relatedConcepts"
                      :key="concept"
                      class="concept-tag"
                      type="info"
                    >
                      {{ concept }}
                    </el-tag>
                  </div>
                </div>

                <div v-if="knowledge.further.relatedReactions && knowledge.further.relatedReactions.length > 0" class="further-section">
                  <h4 class="section-title">相关反应</h4>
                  <div class="related-reactions">
                    <div
                      v-for="(reaction, index) in knowledge.further.relatedReactions"
                      :key="index"
                      class="related-reaction-item"
                    >
                      <div class="reaction-equation" v-html="formatEquation(reaction.equation)"></div>
                      <div class="reaction-description">{{ reaction.description }}</div>
                    </div>
                  </div>
                </div>

                <div v-if="knowledge.further.experimentTips" class="further-section">
                  <h4 class="section-title">实验技巧</h4>
                  <div class="section-content" v-html="knowledge.further.experimentTips"></div>
                </div>

                <div v-if="knowledge.further.commonMistakes" class="further-section">
                  <h4 class="section-title">常见错误</h4>
                  <div class="section-content" v-html="knowledge.further.commonMistakes"></div>
                </div>

                <div v-if="knowledge.further.references && knowledge.further.references.length > 0" class="further-section">
                  <h4 class="section-title">参考资料</h4>
                  <div class="reference-list">
                    <div
                      v-for="(ref, index) in knowledge.further.references"
                      :key="index"
                      class="reference-item"
                    >
                      <span class="ref-index">{{ index + 1 }}.</span>
                      <span class="ref-content">{{ ref }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="暂无深入学习内容" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Reading, WarningFilled, Document, Compass, Warning, CircleCheckFilled, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  knowledge: {
    type: Object,
    default: () => ({})
  }
})

const activeTab = ref('pre-experiment')

function getPreExperimentIcon(type) {
  const icons = {
    safety: Warning,
    principle: Document,
    common: InfoFilled
  }
  return icons[type] || InfoFilled
}

function getPreExperimentIconColor(type) {
  const colors = {
    safety: '#F56C6C',
    principle: '#409EFF',
    common: '#909399'
  }
  return colors[type] || '#909399'
}

function formatEquation(equation) {
  if (!equation) return ''

  let formatted = equation

  // 格式化下标数字
  formatted = formatted.replace(/(\d+)/g, '<sub>$1</sub>')

  // 格式化箭头
  formatted = formatted.replace(/->|→/g, '<span class="arrow">→</span>')

  return formatted
}
</script>

<style scoped lang="scss">
.knowledge-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
  }

  .empty-state {
    padding: 20px 0;
  }

  .knowledge-content {
    .tab-label {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .tab-content {
      padding: 20px;

      .pre-experiment-list {
        .pre-experiment-item {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          border-left: 4px solid;

          &:last-child {
            margin-bottom: 0;
          }

          &.type-safety {
            background-color: var(--el-color-danger-light-9);
            border-left-color: var(--el-color-danger);

            .item-title {
              color: var(--el-color-danger);
            }
          }

          &.type-principle {
            background-color: var(--el-color-primary-light-9);
            border-left-color: var(--el-color-primary);

            .item-title {
              color: var(--el-color-primary);
            }
          }

          &.type-common {
            background-color: var(--el-fill-color-light);
            border-left-color: var(--el-color-info);

            .item-title {
              color: var(--el-text-color-regular);
            }
          }

          .item-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .item-title {
              font-weight: 500;
              font-size: 15px;
            }
          }

          .item-content {
            color: var(--el-text-color-regular);
            line-height: 1.8;
            padding-left: 30px;
          }
        }
      }

      .principle-content,
      .further-content {
        .principle-section,
        .further-section {
          margin-bottom: 25px;

          &:last-child {
            margin-bottom: 0;
          }

          .section-title {
            font-size: 16px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid var(--el-color-primary);
          }

          .section-content {
            color: var(--el-text-color-regular);
            line-height: 1.8;
          }
        }

        .concept-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          .concept-tag {
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: translateY(-2px);
            }
          }
        }

        .related-reactions {
          .related-reaction-item {
            padding: 12px;
            background-color: var(--el-fill-color-light);
            border-radius: 6px;
            margin-bottom: 10px;

            &:last-child {
              margin-bottom: 0;
            }

            .reaction-equation {
              font-family: 'Times New Roman', serif;
              font-size: 15px;
              text-align: center;
              margin-bottom: 8px;

              :deep(sub) {
                font-size: 0.7em;
                vertical-align: sub;
              }

              :deep(.arrow) {
                margin: 0 8px;
              }
            }

            .reaction-description {
              font-size: 13px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .reference-list {
          .reference-item {
            display: flex;
            margin-bottom: 10px;
            line-height: 1.6;

            &:last-child {
              margin-bottom: 0;
            }

            .ref-index {
              color: var(--el-text-color-secondary);
              margin-right: 8px;
              flex-shrink: 0;
            }

            .ref-content {
              color: var(--el-text-color-regular);
            }
          }
        }
      }
    }
  }
}
</style>
