<template>
    <div class="output-history">
      <div class="history-header">
        <h1>输出历史</h1>
        <p class="subtitle">查看您之前的所有对话和生成内容</p>
      </div>
      
      <div class="history-filters">
        <div class="filter-group">
          <label>排序方式:</label>
          <select v-model="sortOrder" class="filter-select">
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>类型:</label>
          <select v-model="filterType" class="filter-select">
            <option value="all">全部</option>
            <option value="chat">聊天</option>
            <option value="document">文档</option>
            <option value="image">图像</option>
          </select>
        </div>
      </div>
      
      <div class="history-list">
        <div 
          v-for="item in filteredHistory" 
          :key="item.id"
          class="history-item"
          @click="viewHistoryItem(item)"
        >
          <div class="history-icon">{{ item.icon }}</div>
          <div class="history-content">
            <div class="history-title">{{ item.title }}</div>
            <div class="history-preview">{{ item.preview }}</div>
            <div class="history-meta">
              <span class="history-date">{{ item.date }}</span>
              <span class="history-type">{{ item.type }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredHistory.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>没有找到历史记录</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const sortOrder = ref('newest')
  const filterType = ref('all')
  
  const historyData = ref([
    { 
      id: 1, 
      title: '数学教学计划生成', 
      preview: '为六年级学生创建的一个为期两周的分数教学计划，包括互动活动和评估方法。', 
      date: '2023-10-15 14:30', 
      type: '文档', 
      icon: '📝' 
    },
    { 
      id: 2, 
      title: '科学实验指导', 
      preview: '关于植物生长实验的详细指导，包括材料清单、步骤和观察表格。', 
      date: '2023-10-14 10:15', 
      type: '文档', 
      icon: '🧪' 
    },
    { 
      id: 3, 
      title: '班级管理策略', 
      preview: '我们讨论了处理课堂干扰的有效策略和建立积极学习环境的方法。', 
      date: '2023-10-12 16:45', 
      type: '聊天', 
      icon: '💬' 
    },
    { 
      id: 4, 
      title: '学生评估表格', 
      preview: '为期末项目创建的评估表格，包括多个评分标准和反馈部分。', 
      date: '2023-10-10 09:20', 
      type: '文档', 
      icon: '📊' 
    },
    { 
      id: 5, 
      title: '创意写作提示', 
      preview: '为中学生生成的一系列创意写作提示，专注于叙事和角色发展。', 
      date: '2023-10-08 13:10', 
      type: '聊天', 
      icon: '✏️' 
    }
  ])
  
  const filteredHistory = computed(() => {
    let result = [...historyData.value]
    
    // 应用类型过滤
    if (filterType.value !== 'all') {
      const typeMap = {
        'chat': '聊天',
        'document': '文档',
        'image': '图像'
      }
      result = result.filter(item => item.type === typeMap[filterType.value])
    }
    
    // 应用排序
    result.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
    })
    
    return result
  })
  
  const viewHistoryItem = (item) => {
    console.log('查看历史项目:', item.title)
    // 实现查看历史项目的逻辑
  }
  </script>
  
  <style scoped>
  .output-history {
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    height: 100%;
    overflow-y: auto;
  }
  
  .history-header {
    margin-bottom: 30px;
    text-align: center;
  }
  
  .history-header h1 {
    font-size: 28px;
    color: #111827;
    margin-bottom: 8px;
  }
  
  .history-header .subtitle {
    color: #6b7280;
    font-size: 16px;
  }
  
  .history-filters {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 16px;
    background: #f3f4f6;
    border-radius: 8px;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
  }
  
  .filter-group label {
    margin-right: 8px;
    color: #4b5563;
  }
  
  .filter-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #111827;
    font-size: 14px;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .history-item {
    display: flex;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .history-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
  
  .history-icon {
    font-size: 24px;
    margin-right: 16px;
    color: #6b7280;
  }
  
  .history-content {
    flex: 1;
  }
  
  .history-title {
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
    font-size: 16px;
  }
  
  .history-preview {
    color: #4b5563;
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .history-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6b7280;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #6b7280;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 768px) {
    .output-history {
      padding: 20px;
    }
    
    .history-filters {
      flex-direction: column;
      gap: 12px;
    }
  }
  </style>