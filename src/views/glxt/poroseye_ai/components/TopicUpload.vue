<template>
    <div class="knowledge-wrapper">
        <!-- 顶部导航栏 -->

        <!-- {{ state  }} -->
        <div class="top-header">
            <div class="header-content">
                <!-- {{ currentClassifyData }} -->
                <!-- <h1 class="page-title">知识管理</h1> -->

                <!-- {{ createForm }} -->
                <div class="tab-navigation">
                    <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]"
                        @click="switchTab(tab.key)">
                        <span class="tab-icon">{{ tab.icon }}</span>
                        <span>{{ tab.label }}</span>
                    </button>
                </div>

                <div class="header-actions">
                    <div class="search-box">
                        <span class="search-icon"><el-icon>
                                <Search />
                            </el-icon></span>
                        <input v-model="searchQuery" :placeholder="activeTab === 'knowledge' ? '搜索知识库' : '搜索文章'"
                            class="search-field" />
                    </div>
                    <el-button type="primary" plain icon="Plus" @click="handleCreate">
                        {{ activeTab === 'knowledge' ? '新建知识库' : '新建文章' }}
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-area">
            <!-- 知识库内容 -->
            <div v-if="activeTab === 'knowledge'" class="knowledge-content">
                <!-- 知识库列表 -->
                <div class="list-container">
                    <!-- 表格容器 -->
                    <div class="table-container">
                        <div class="table-content">
                            <el-table :data="filteredKnowledge" v-loading="loading" element-loading-text="解析过程稍慢，请耐心等待...">
                                <el-table-column label="序号" type="index" align="center" width="50px" />
                                <el-table-column label="id" align="center" prop="id" />
                                <el-table-column label="文件名称" align="center" prop="name" />
                                <el-table-column label="描述" align="center" prop="description" />
                                <!-- <el-table-column label="大小" align="center" prop="size" /> -->
                                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                                    <template #default="scope">
                                        <el-button plain type="success" icon="Edit" color="#6EDC93"
                                            @click="handleKnowledgeUpdate(scope.row)">修改</el-button>
                                        <el-button plain type="danger" icon="Delete"
                                            @click="handleKnowledgeDelete(scope.row)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>

                            <div class="pagination-container">
                                <el-pagination v-model:page="queryClassifyKnowledgeParams.pageNum"
                                    v-model:limit="queryClassifyKnowledgeParams.pageSize" :page-sizes="[10, 20, 30, 50]"
                                    :total="aiClassifyKnowledgeTotal" v-show="aiClassifyKnowledgeTotal > 0" background
                                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleChange"
                                    @current-change="handleChange" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 文件上传视图 -->
                <!-- <div v-if="currentView === 'upload'" class="upload-container">
                    <div class="section-header">
                        <button class="back-btn" @click="backToList">
                            <span>←</span> 返回
                        </button>
                        <div class="upload-info">
                            <h2 class="section-title">{{ selectedKnowledge?.name }}</h2>
                            <span class="section-subtitle">文件上传</span>
                        </div>
                    </div>

                    <div class="upload-area">
                        <div class="drop-zone">
                            <div class="drop-content">
                                <span class="drop-icon">📤</span>
                                <h3 class="drop-title">上传文件</h3>
                                <p class="drop-desc">
                                    拖拽文件到此处，或点击选择文件<br>
                                    支持 PDF、Word、Excel、TXT 等格式
                                </p>
                                <input ref="fileInput" type="file" multiple @change="handleFileSelect"
                                    style="display: none;" />
                                <button class="select-btn" @click="$refs.fileInput.click()">
                                    选择文件
                                </button>
                            </div>
                        </div>

                        <div v-if="fileList.length > 0" class="file-list-area">
                            <h3 class="list-title">待上传文件</h3>
                            <div class="files">
                                <div v-for="(file, index) in fileList" :key="index" class="file-row">
                                    <div class="file-info">
                                        <span class="file-icon">📄</span>
                                        <div class="file-data">
                                            <div class="file-name">{{ file.name }}</div>
                                            <div class="file-size">{{ formatFileSize(file.size) }}</div>
                                        </div>
                                    </div>
                                    <button class="remove-btn" @click="removeFile(index)">✕</button>
                                </div>
                            </div>

                            <div class="upload-actions">
                                <button class="btn-secondary" @click="clearFiles">清空</button>
                                <button class="btn-primary" @click="submitUpload" :disabled="isUploading">
                                    {{ isUploading ? '上传中...' : '开始上传' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div> -->
            </div>

            <!-- 文章内容 -->
            <div v-if="activeTab === 'articles'" class="articles-content">
                <div class="section-header">
                    <h2 class="section-title">文章</h2>
                    <span class="item-count">{{ aiClassifyArticleTotal }} 篇</span>
                </div>

                <div class="cards-grid">
                    <div v-for="item in filteredArticles" :key="item.id" class="article-card">
                        <!-- @click="editArticle(item)" -->
                        <div class="card-content">
                            <div class="card-top">
                                <div class="article-avatar">📝</div>
                                <!-- 优化后的菜单按钮 -->
                                <el-dropdown trigger="click" @click.stop placement="bottom-end">
                                    <button class="card-menu" @click.stop>
                                        <el-icon>
                                            <MoreFilled />
                                        </el-icon>
                                    </button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item @click="editArticle(item)">
                                                <el-icon>
                                                    <Edit />
                                                </el-icon>
                                                编辑
                                            </el-dropdown-item>
                                            <el-dropdown-item @click="deleteArticle(item)" class="delete-item">
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                                删除
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>

                            <div class="card-body">
                                <h3 class="article-title">{{ item.title }}</h3>
                                <p class="article-excerpt">{{ item.content }}</p>
                            </div>

                            <div class="card-bottom">
                                <div class="article-meta">
                                    <span class="meta-item">
                                        <el-icon>
                                            <Clock />
                                        </el-icon>
                                        {{ formatDate(item.createTime) }}
                                    </span>
                                </div>
                                <!-- 优化后的标签管理区域 -->
                                <div class="article-tags-section">
                                    <div class="article-tags">
                                        <template v-if="item.mtAiTagsList && item.mtAiTagsList.length > 0">
                                            <el-tag v-for="tag in item.mtAiTagsList.slice(0, 2)" :key="tag" size="small"
                                                type="info" effect="plain">
                                                {{ tag }}
                                            </el-tag>
                                            <!-- <el-tag v-if="item.mtAiTagsList.length > 2" size="small" type="info" effect="plain">
                                                +{{ item.mtAiTagsList.length - 2 }}
                                            </el-tag> -->

                                            <!-- 查看更多标签 -->
                                            <el-popover v-if="item.mtAiTagsList.length > 2" placement="bottom" :width="200"
                                                trigger="hover" popper-class="tags-popover">
                                                <template #reference>
                                                    <el-tag size="small" type="info" effect="plain"
                                                        class="more-tags-indicator">
                                                        +{{ item.mtAiTagsList.length - 2 }}
                                                    </el-tag>
                                                </template>
                                                <div class="all-tags-container">
                                                    <span class="all-tags-title">所有标签</span>
                                                    <div class="all-tags-list">
                                                        <el-tag v-for="tag in item.mtAiTagsList" :key="tag" size="small"
                                                            type="info" effect="plain" class="tag-in-popover">
                                                            {{ tag }}
                                                        </el-tag>
                                                    </div>
                                                </div>
                                            </el-popover>
                                        </template>

                                        <template v-else>
                                            <span class="no-tags">暂无标签</span>
                                        </template>
                                    </div>
                                    <el-button @click.stop="showTagsManager(item)" class="tag-manage-btn" size="small"
                                        type="primary" :icon="Setting" circle plain />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 创建知识库模态框 -->
        <el-dialog title="创建知识库" v-model="showCreateModal" width="600px" append-to-body>
            <el-form ref="createFormRef" :model="createForm" label-width="80px" >
                <el-form-item label="文件" prop="fileUrl">
                    <file-upload v-model="createForm.fileUrl" @fileData="fileSuccessData" @fileDataMsg="fileSuccessMsg"/>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input v-model="createForm.name" placeholder="请输入名称" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" :rows="2" maxlength="500" v-model="createForm.description"
                        placeholder="请输入描述" />
                </el-form-item>
                <el-form-item label="是否公开" prop="isPublic">
                    <el-switch v-model="createForm.isPublic" inline-prompt active-text="是" inactive-text="否" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="closeCreateModal">取 消</el-button>
                    <el-button type="primary" @click="submitCreateKnowledge">确 定</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 文章弹框 -->
        <el-dialog title="新建文章" v-model="showCreateArticleModal" width="800px" append-to-body>
            <el-form ref="createArticleFormRef" :model="createArticleForm" label-width="80px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="createArticleForm.title" placeholder="请输入文章标题" />
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <editor v-model="createArticleForm.content" :min-height="500" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="closeCreateModal">取 消</el-button>
                    <el-button type="primary" @click="submitCreateArticle">确 定</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 标签管理模态框 -->
        <el-dialog title="管理标签" v-model="showTagsModal" width="500px" :before-close="() => showTagsModal = false">
            <div class="tags-form">
                <div class="current-tags" v-if="currentEditArticle?.tags?.length">
                    <p class="tags-label">当前标签：</p>
                    <div class="tags-display">
                        <el-tag v-for="tag in currentEditArticle.tags" :key="tag" closable @close="removeTag(tag)"
                            type="info">
                            {{ tag }}
                        </el-tag>
                    </div>
                </div>

                <div class="add-tags">
                    <p class="tags-label">添加标签：</p>
                    <el-input v-model="newTagInput" placeholder="输入标签名称，按回车添加" @keyup.enter="addNewTag"
                        class="tag-input">
                        <template #append>
                            <el-button @click="addNewTag" :disabled="!newTagInput.trim()">
                                添加
                            </el-button>
                        </template>
                    </el-input>
                </div>

                <div class="common-tags" v-if="commonTags.length">
                    <p class="tags-label">常用标签：</p>
                    <div class="tags-display">
                        <el-tag v-for="tag in commonTags" :key="tag" @click="addCommonTag(tag)" class="clickable-tag"
                            type="success" effect="plain">
                            {{ tag }}
                        </el-tag>
                    </div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showTagsModal = false">取消</el-button>
                    <el-button type="primary" @click="saveArticleTags">保存</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MoreFilled, Edit, Delete, Clock, Setting } from '@element-plus/icons-vue'
import { getCurrentInstance } from 'vue'
import { Search } from '@element-plus/icons-vue'
import {
    listaiClassifyKnowledge, getaiClassifyKnowledge, delaiClassifyKnowledge,
    addaiClassifyKnowledge, updateaiClassifyKnowledge
} from "@/api/glxt/aiClassifyKnowledge";

import {
    listaiClassifyArticle, getaiClassifyArticle, delaiClassifyArticle,
    addaiClassifyArticle, updateaiClassifyArticle
} from "@/api/glxt/aiClassifyArticle";

// 引入历史搜索API
import { listAiClassify, getAiClassify, delAiClassify, addAiClassify, updateAiClassify } from "@/api/glxt/aiClassify";

import {
    listAitags, getAitags, addAitags, batchAddAitags,
    updateAitags, delAitags
} from "@/api/glxt/aitags";

import { inject } from 'vue'

//获取用户信息
import { getUserProfile } from "@/api/system/user";


const state = reactive({
    user: {},
    roleGroup: {},
    postGroup: {}
});


function getUser() {
    getUserProfile().then(response => {
        state.user = response.data;
        state.roleGroup = response.roleGroup;
        state.postGroup = response.postGroup;
    });
};

getUser();


const { proxy } = getCurrentInstance();
const { mt_school_type } = proxy.useDict('mt_school_type');

const topicData = inject('topicData')

const tabs = [
    { key: 'knowledge', label: '知识库', icon: '📚' },
    { key: 'articles', label: '文章', icon: '📝' }
]

const activeTab = ref('knowledge')
const currentView = ref('list')
const selectedKnowledge = ref(null)
const searchQuery = ref('')
const fileList = ref([])
const isUploading = ref(false)
const showCreateModal = ref(false)
const showCreateArticleModal = ref(false)
const loading = ref(false);
import { useRouter } from 'vue-router'
import { el } from 'element-plus/es/locale/index.mjs'


const route = useRoute()

const createForm = ref({
    name: '',
    description: '',
    aiClassifyId: '',

    type: '',
    size: '',
    fileUrl: '',
    isPublic: false,
    file: null,

    userId: 1,
    role: 1,
    categoryId:666
})

const resetCreateForm = () => {
    console.log('resetCreateForm')
    createForm.value = {
        id: null,
        name: null,
        description: null,
        type: null,
        fileUrl: null,
        isPublic: null,
    }
}

const createArticleForm = ref({
    aiClassifyId: '',
    title: '',
    content: '',

})

//重置文章表单
const resetCreateArticleForm = () => {
    console.log('resetCreateArticleForm')
    createArticleForm.value = {
        id: null,
        title: null,
        content: null,
    }
}

const filteredKnowledge = computed(() => {
    if (!searchQuery.value) return aiClassifyKnowledgeList.value
    return aiClassifyKnowledgeList.value.filter(item =>
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const filteredArticles = computed(() => {
    if (!searchQuery.value) return aiClassifyArticleList.value
    return aiClassifyArticleList.value.filter(item =>
        item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const switchTab = (tab) => {
    activeTab.value = tab
    currentView.value = 'list'
    searchQuery.value = ''
    console.log(tab)
    if ('articles' == tab) {
        getAiClassifyArticleList()
    }
    if ('knowledge' == tab) {
        getAiClassifyKnowledgeList()
    }
}

const handleCreate = () => {
    if (activeTab.value === 'knowledge') {
        resetCreateForm()
        showCreateModal.value = true
    } else {
        console.log('创建文章')
        resetCreateArticleForm()
        showCreateArticleModal.value = true
    }
}

const handleKnowledgeUpdate = (row) => {
    resetCreateForm()

    getaiClassifyKnowledge(row.id).then(response => {
        if (response.code === 200) {
            createForm.value = response.data;
            showCreateModal.value = true
        } else {
            ElMessage.error('获取知识库详情失败');
            closeCreateModal()
        }
    });
}

const handleKnowledgeDelete = (row) => {

    ElMessageBox.confirm(
        `确定要删除吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        delaiClassifyKnowledge(row.id).then(response => {
            if (response.code == 200) {
                ElMessage.success('删除成功')
                getAiClassifyKnowledgeList()
            } else {
                ElMessage.error('删除失败')
            }
        });
        console.log('删除知识库')
    }).catch(() => {
        ElMessage.info('取消删除')
    })
}

const queryClassifyKnowledgeParams = ref({
    pageNum: 1,
    pageSize: 10,
    aiClassifyId: '',
    name: ''
})

const aiClassifyKnowledgeList = ref([]);
const aiClassifyKnowledgeTotal = ref(0);
function getAiClassifyKnowledgeList() {
    // loading.value = true
    listaiClassifyKnowledge(queryClassifyKnowledgeParams.value).then(response => {
        aiClassifyKnowledgeList.value = response.rows;
        aiClassifyKnowledgeTotal.value = response.total;
        // loading.value = false
    });
}

const handleChange = (val) => {
    queryClassifyKnowledgeParams.value.pageNum = val
    getAiClassifyKnowledgeList()
}

const queryClassifyArticleParams = ref({
    pageNum: 1,
    pageSize: 10,
    aiClassifyId: '',
    name: ''
})

const aiClassifyArticleList = ref([]);
const aiClassifyArticleTotal = ref(0);

//获取章节列表
function getAiClassifyArticleList() {
    queryClassifyArticleParams.value.aiClassifyId = currentClassifyData.value.id
    listaiClassifyArticle(queryClassifyArticleParams.value).then(response => {
        aiClassifyArticleList.value = response.rows;
        aiClassifyArticleTotal.value = response.total;
    });
}

const handleTopicData = () => {
    if (topicData?.topicObject?.value) {
        currentClassifyData.value = topicData.topicObject.value
        queryClassifyKnowledgeParams.value.aiClassifyId = currentClassifyData.value.id
        queryClassifyArticleParams.value.aiClassifyId = currentClassifyData.value.id
        // 获取知识库列表
        getAiClassifyKnowledgeList()
        // 获取文章列表
        getAiClassifyArticleList()
    } else {
        // 如果没有通过 provide/inject 获取到数据，尝试从路由参数获取
        const route = useRoute()
        const id = route.params.id
        if (id) {
            // 根据 ID 获取分类详情
            getAiClassify(id).then(response => {
                if (response.code === 200) {
                    currentClassifyData.value = response.data
                    queryClassifyKnowledgeParams.value.aiClassifyId = id
                    queryClassifyArticleParams.value.aiClassifyId = id
                    // 获取知识库列表
                    getAiClassifyKnowledgeList()
                    // 获取文章列表
                    getAiClassifyArticleList()
                }
            })
        }
        
    }
}

const currentClassifyData = ref({})
const knowledgeList = ref([])
const articlesList = ref([])



// 组件挂载时初始化数据
onMounted(() => {
    handleTopicData()
    // 从路由参数判断操作类型和实验ID
    // const { type, id } = route.query
    // console.log('type', type)
    // console.log('id', id)
})

// 监听 topicObject 的变化
// watch(() => topicData.topicObject.value, (newVal) => {
//     if (newVal) {
//         handleTopicData()
//     }
// }, { immediate: true })

const fileSuccessData = (data) => {
    console.log('接收到文件上传子组件的数据', data)
    // createForm.value.name = data.name.split(".")[0]
    createForm.value.name = data.name
    createForm.value.fileUrl = data.url,
        createForm.value.size = data.fileSize
    createForm.value.type = data.name.split(".")[1]
}

//接收子组件的文件数据
const fileSuccessMsg = (fileData) => {
    console.log('接收到文件上传子组件的消息============================')
    console.log(fileData)
    console.log(fileData.raw.file)
    createForm.value.file = fileData.raw
    console.log('接收到文件上传子组件的消息============================')
}

const deleteArticle = (article) => {
    ElMessageBox.confirm(
        `确定要删除文章「${article.title}」吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        delaiClassifyArticle(article.id).then(response => {
            if (response.code == 200) {
                ElMessage.success('删除成功')
                getAiClassifyArticleList()
            } else {
                ElMessage.error('删除失败')
            }
        });
    }).catch(() => {
        ElMessage.info('取消删除')
    })
}

const backToList = () => {
    currentView.value = 'list'
    selectedKnowledge.value = null
    fileList.value = []
}

const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    fileList.value = [...fileList.value, ...files]
}

const removeFile = (index) => {
    fileList.value.splice(index, 1)
}

const clearFiles = () => {
    fileList.value = []
}

const submitUpload = async () => {
    isUploading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('上传成功')
        backToList()
    } finally {
        isUploading.value = false
    }
}

const editArticle = (article) => {
    console.log('编辑文章', article)

    resetCreateArticleForm()
    getaiClassifyArticleData(article.id)
    showCreateArticleModal.value = true
    // getaiClassifyArticle(article.id).then(response => {
    //     if (response.code === 200) {
    //         createArticleForm.value = response.data;
    //         showCreateArticleModal.value = true
    //     } else {
    //         ElMessage.error('获取分类详情失败');
    //         closeCreateModal()
    //     }
    // });
}


//获取文章详情
const getaiClassifyArticleData = (id) => {
    getaiClassifyArticle(id).then(response => {
        if (response.code === 200) {
            createArticleForm.value = response.data;
        } else {
            ElMessage.error('获取分类详情失败');
            closeCreateModal()
        }
    });
}

const closeCreateModal = () => {
    showCreateModal.value = false
    showCreateArticleModal.value = false
    resetCreateForm()
    resetCreateArticleForm()
}

const submitCreateKnowledge = () => {
    console.log('createForm', createForm)
    createForm.value.aiClassifyId = currentClassifyData.value.id
    loading.value = true
    if (createForm.value.id) {
        updateaiClassifyKnowledge(createForm.value).then(response => {
  
            if (response.code === 200) {
                proxy.$modal.msgSuccess("修改成功");
                getAiClassifyKnowledgeList();
                loading.value = false
            } else {
                proxy.$modal.msgError("修改失败");
                loading.value = false
             
            }
        })
    } else {
        createForm.value.userId =  currentClassifyData.value.userId
        createForm.value.categoryId = currentClassifyData.value.id
        createForm.value.role = 1
        console.log('createForm---=-=-=-=')
        console.log(currentClassifyData)
        console.log('createForm---=-=-=-=')
        addaiClassifyKnowledge(createForm.value).then(response => {
            
            
            if (response.code === 200) {
                proxy.$modal.msgSuccess("创建成功");
                getAiClassifyKnowledgeList();
                
                loading.value = false
            } 
            // else {
            //     proxy.$modal.msgError("创建失败");
            // }
            
        });
    }

    closeCreateModal()
}

const submitCreateArticle = () => {
    createArticleForm.value.aiClassifyId = currentClassifyData.value.id

    if (createArticleForm.value.id) {
        updateaiClassifyArticle(createArticleForm.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            getAiClassifyArticleList();
        });
    } else {
        addaiClassifyArticle(createArticleForm.value).then(response => {
            proxy.$modal.msgSuccess("创建成功");
            getAiClassifyArticleList();
        });
    }

    closeCreateModal()
}

const showTagsManager = (article) => {
    currentEditArticle.value = { ...article };
    if (!currentEditArticle.value.tags) {
        currentEditArticle.value.tags = [];
    }
    newTagInput.value = '';
    showTagsModal.value = true;
}

const showTagsModal = ref(false);
const currentEditArticle = ref(null);
const newTagInput = ref('');

const commonTags = ref(['技术', '教程', 'Vue.js', 'JavaScript', 'CSS', '前端', '后端', '数据库', '算法', '设计模式']);


//添加标签  逻辑添加  不走库
const addNewTag = () => {
    const tag = newTagInput.value.trim();
    if (tag && !currentEditArticle.value.tags.includes(tag)) {
        currentEditArticle.value.tags.push(tag);
        newTagInput.value = '';
    }
}


//点击常用标签
const addCommonTag = (tag) => {
    if (!currentEditArticle.value.tags.includes(tag)) {
        currentEditArticle.value.tags.push(tag);
    }
}


//删除标签
const removeTag = (tag) => {
    const index = currentEditArticle.value.tags.indexOf(tag);
    if (index > -1) {
        currentEditArticle.value.tags.splice(index, 1);
    }
}

//保存标签
const saveArticleTags = () => {
    if (!currentEditArticle.value) return;

    // console.log('currentEditArticle', currentEditArticle.value)
    const obj = {
        mtAiTags: currentEditArticle.value.tags,
        aiClassifyArticleId: currentEditArticle.value.id
    }
    //批量保存标签
    batchAddAitags(obj).then(response => {
        if (response.code === 200) {
            ElMessage.success('标签更新成功');
            getAiClassifyArticleList();
            // getaiClassifyArticleData(currentEditArticle.value.id);
        } else {
            ElMessage.error('标签更新失败');
        }
    });

    showTagsModal.value = false;
}


//计算时间
// const formatDate = (dateStr) => {
//     const date = new Date(dateStr)
//     const now = new Date()
//     const diffTime = Math.abs(now - date)
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

//     if (diffDays === 1) return '昨天'
//     if (diffDays < 7) return `${diffDays}天前`
//     if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
//     return date.toLocaleDateString('zh-CN')
// }
const formatDate = (dateStr) => {
  // 验证输入是否有效
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return '无效日期';
  }

  const now = new Date();
  // 设置时间为当天的00:00:00以比较日期差异，避免小时影响
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`;
  
  // 使用更详细的日期格式
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-'); // 格式化为 YYYY-MM-DD
};


const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.knowledge-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fafbfc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    margin: 0;
    padding: 0;
}

.top-header {
    background: white;
    border-bottom: 1px solid #e1e5e9;
    flex-shrink: 0;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 12px 16px;
    height: 93px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    flex-shrink: 0;
}

.tab-navigation {
    display: flex;
    gap: 2px;
    background: #f6f8fa;
    padding: 2px;
    border-radius: 6px;
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: none;
    background: none;
    border-radius: 4px;
    color: #656d76;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 33.5px;
}

.tab-btn:hover {
    color: #1a1a1a;
    background: rgba(255, 255, 255, 0.7);
}

.tab-btn.active {
    color: #1a1a1a;
    background: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.tab-icon {
    font-size: 12px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 8px;
    font-size: 12px;
    color: #656d76;
}

.search-field {
    width: 200px;
    height: 33.5px;
    padding: 0 8px 0 24px;
    border: 1px solid #d1d9e0;
    border-radius: 4px;
    font-size: 13px;
    background: white;
    transition: border-color 0.2s ease;
}

.search-field:focus {
    outline: none;
    border-color: #409eff;
}

.content-area {
    flex: 1;
    overflow: hidden;
}

.knowledge-content,
.articles-content {
    background: white;
    border: 1px solid #d1d9e0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.list-container,
.upload-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.section-header {
    padding: 12px 16px;
    border-bottom: 1px solid #d1d9e0;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    background: none;
    border: 1px solid #d1d9e0;
    border-radius: 3px;
    color: #656d76;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.back-btn:hover {
    background: #f6f8fa;
    border-color: #8c959f;
}

.upload-info {
    flex: 1;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.section-subtitle {
    color: #656d76;
    font-size: 13px;
}

.item-count {
    color: #656d76;
    font-size: 11px;
    background: #f6f8fa;
    padding: 1px 5px;
    border-radius: 8px;
}

.table-container {
    flex: 1;
    overflow: auto;
}

.table-content {
    display: flex;
    flex-direction: column;
    margin: 10px 10px;
}

.cards-grid {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    overflow: auto;
    flex: 1;
}

.article-card {
    border: 1px solid #d1d9e0;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
    cursor: pointer;
    height: fit-content;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.article-card:hover {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
}

.card-content {
    padding: 16px;
}

.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.article-avatar {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
}

.card-menu {
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    border-radius: 4px;
    color: #909399;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 16px;
}

.card-menu:hover {
    background: #f5f7fa;
    color: #409eff;
}

.card-body {
    margin-bottom: 16px;
}

.article-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-excerpt {
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 12px;
    border-top: 1px solid #f0f2f5;
}

.article-meta {
    display: flex;
    gap: 12px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 12px;
}

.article-tags-section {
    display: flex;
    align-items: center;
    gap: 8px;
}

.article-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    align-items: center;
}

.no-tags {
    color: #c0c4cc;
    font-size: 12px;
    font-style: italic;
}

.tag-manage-btn {
    width: 24px !important;
    height: 24px !important;
    min-width: 24px !important;
    padding: 0 !important;
}

.upload-area {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: auto;
    flex: 1;
}

.drop-zone {
    border: 2px dashed #d1d9e0;
    border-radius: 6px;
    padding: 32px 20px;
    text-align: center;
    transition: border-color 0.2s ease;
}

.drop-zone:hover {
    border-color: #8c959f;
}

.drop-content {
    max-width: 350px;
    margin: 0 auto;
}

.drop-icon {
    font-size: 32px;
    margin-bottom: 10px;
    display: block;
}

.drop-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 5px 0;
}

.drop-desc {
    color: #656d76;
    font-size: 13px;
    line-height: 1.4;
    margin: 0 0 16px 0;
}

.select-btn {
    padding: 6px 12px;
    background: #0969da;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.select-btn:hover {
    background: #0860ca;
}

.file-list-area {
    border: 1px solid #d1d9e0;
    border-radius: 6px;
    padding: 16px;
}

.list-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 10px 0;
}

.files {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
}

.file-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background: #f6f8fa;
    border-radius: 4px;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.file-icon {
    font-size: 14px;
    color: #656d76;
}

.file-data {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.file-name {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a1a;
}

.file-size {
    font-size: 11px;
    color: #656d76;
}

.remove-btn {
    width: 18px;
    height: 18px;
    border: none;
    background: none;
    border-radius: 2px;
    color: #656d76;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 12px;
}

.remove-btn:hover {
    background: #ffebe9;
    color: #d1242f;
}

.upload-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid #d1d9e0;
}

.btn-secondary,
.btn-primary {
    padding: 5px 10px;
    border: 1px solid #d1d9e0;
    border-radius: 3px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary {
    background: white;
    color: #656d76;
}

.btn-secondary:hover {
    background: #f6f8fa;
    border-color: #8c959f;
}

.btn-primary {
    background: #1f883d;
    color: white;
    border-color: #1f883d;
}

.btn-primary:hover {
    background: #1a7f37;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tags-form {
    padding: 0 4px;
}

.tags-label {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
}

.current-tags,
.add-tags,
.common-tags {
    margin-bottom: 20px;
}

.tags-display {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.clickable-tag {
    cursor: pointer;
    transition: all 0.2s;
}

.clickable-tag:hover {
    transform: scale(1.05);
}

.tag-input {
    margin-top: 8px;
}

:deep(.el-dropdown-menu__item.delete-item) {
    color: #f56c6c;
}

:deep(.el-dropdown-menu__item.delete-item:hover) {
    background-color: #fef0f0;
    color: #f56c6c;
}


.more-tags-indicator {
  cursor: pointer;
}

.all-tags-container {
  padding: 4px;
}

.all-tags-title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.all-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-in-popover {
  margin: 2px;
}

:deep(.tags-popover) {
  max-width: 300px;
}
  


@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        height: auto;
        padding: 8px 12px;
        gap: 8px;
    }

    .header-actions {
        width: 100%;
        margin-left: 0;
    }

    .search-field {
        flex: 1;
        width: auto;
    }

    .cards-grid {
        grid-template-columns: 1fr;
        padding: 8px;
    }

    .section-header {
        padding: 8px 12px;
    }

    .upload-area {
        padding: 8px 12px;
    }
}
</style>




