<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="平台名称" prop="platformName">
        <el-input
          v-model="queryParams.platformName"
          placeholder="请输入平台名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="平台状态" clearable>
          <el-option label="启用" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="handleQuery">搜索</el-button>
        <el-button size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="mini"
          @click="handleAdd"
          v-hasPermi="['glxt:aiPlatform:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['glxt:aiPlatform:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="platformList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="平台图标" width="80" align="center">
        <template #default="scope">
          <img v-if="scope.row.icon" :src="scope.row.icon" class="table-icon" />
          <span v-else class="table-icon-placeholder">-</span>
        </template>
      </el-table-column>
      <el-table-column label="平台名称" prop="platformName" :show-overflow-tooltip="true" />
      <el-table-column label="平台编码" prop="platformCode" :show-overflow-tooltip="true" />
      <el-table-column label="描述" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="类型" prop="isPreset" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.isPreset === 1" type="success" size="mini">预设平台</el-tag>
          <el-tag v-else type="info" size="mini">自定义平台</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="创建时间" prop="createTime" width="160" align="center">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleViewConfig(scope.row)"
            v-hasPermi="['glxt:aiConfig:list']"
          >配置</el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['glxt:aiPlatform:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
            v-hasPermi="['glxt:aiPlatform:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page="queryParams.pageNum"
      :limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <!-- 平台类型选择（仅新增时显示） -->
        <el-form-item label="平台类型" prop="platformType" v-if="!form.id">
          <el-radio-group v-model="platformType" @change="handlePlatformTypeChange">
            <el-radio label="preset">
              <span class="radio-label">
                预设平台
                <span class="radio-desc">系统内置，开箱即用</span>
              </span>
            </el-radio>
            <el-radio label="custom">
              <span class="radio-label">
                自定义平台
                <span class="radio-desc">手动配置所有参数</span>
              </span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 预设平台选择 -->
        <el-form-item label="选择平台" prop="selectedPreset" v-if="platformType === 'preset' && !form.id">
          <el-select v-model="form.selectedPreset" placeholder="请选择预设平台" @change="handlePresetChange" style="width: 100%">
            <el-option
              v-for="preset in presetPlatforms"
              :key="preset.code"
              :label="preset.name"
              :value="preset.code"
            >
              <div class="preset-option">
                <span class="preset-name">{{ preset.name }}</span>
                <span class="preset-desc">{{ preset.description }}</span>
              </div>
            </el-option>
          </el-select>
          <div class="help-block">选择预设平台后，系统将自动填充平台配置信息</div>
        </el-form-item>

        <el-divider v-if="platformType === 'preset' && !form.id">配置信息</el-divider>

        <!-- 平台名称 -->
        <el-form-item label="平台名称" prop="platformName">
          <el-input v-model="form.platformName" placeholder="请输入平台名称" maxlength="50" :disabled="platformType === 'preset' && !form.id" />
        </el-form-item>

        <!-- 平台编码（预设平台不可编辑） -->
        <el-form-item label="平台编码" prop="platformCode" v-if="platformType === 'custom' || form.id">
          <el-input v-model="form.platformCode" placeholder="请输入平台编码，如：openai、zhipu_glm" maxlength="30" :disabled="form.isPreset === 1 && form.id" />
          <div class="help-block" v-if="platformType === 'custom'">用于系统内部识别平台的唯一标识，建议使用英文小写和下划线</div>
        </el-form-item>

        <!-- 平台图标（自定义平台可设置） -->
        <el-form-item label="平台图标" prop="icon" v-if="platformType === 'custom' || form.id">
          <el-input v-model="form.icon" placeholder="请输入图标URL" :disabled="form.isPreset === 1 && form.id">
            <template #prepend>
              <img v-if="form.icon" :src="form.icon" class="icon-preview" />
              <span v-else class="icon-placeholder">图标</span>
            </template>
          </el-input>
          <div class="help-block" v-if="platformType === 'custom'">建议尺寸：64x64像素，支持PNG、JPG、SVG格式</div>
        </el-form-item>

        <!-- 平台描述 -->
        <el-form-item label="平台描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入平台描述，如：官网地址、特色功能等" />
        </el-form-item>

        <!-- 排序和状态 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" style="width: 100%" />
              <div class="help-block">数值越小越靠前</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">启用</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 备注 -->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>

        <!-- 预设平台提示信息 -->
        <el-alert
          v-if="platformType === 'preset' && !form.id"
          title="预设平台说明"
          type="info"
          :closable="false"
          style="margin-top: 10px"
        >
          <template #default>
            <ul class="preset-tips">
              <li>预设平台是系统内置的AI服务平台，配置已预先设置好</li>
              <li>添加后只需在API配置中填写API密钥即可使用</li>
              <li>预设平台的编码和图标由系统自动生成，无需手动配置</li>
            </ul>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listPlatform, getPlatform, delPlatform, addPlatform, updatePlatform, togglePlatformStatus, getActivePresets } from "@/api/glxt/aiPlatform";

export default {
  name: "AiPlatform",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 平台表格数据
      platformList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 平台类型：preset-预设平台，custom-自定义平台
      platformType: 'preset',
      // 预设平台列表（从后端获取）
      presetPlatforms: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        platformName: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        platformName: [
          { required: true, message: "平台名称不能为空", trigger: "blur" }
        ],
        platformCode: [
          { required: true, message: "平台编码不能为空", trigger: "blur" },
          { pattern: /^[a-z0-9_]+$/, message: "平台编码只能包含小写字母、数字和下划线", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getPresetPlatforms();
  },
  methods: {
    /** 获取预设平台列表 */
    getPresetPlatforms() {
      getActivePresets().then(response => {
        this.presetPlatforms = response.data.map(item => ({
          code: item.platformCode,
          name: item.platformName,
          description: item.description,
          iconUrl: item.iconUrl
        }));
      }).catch(error => {
        console.error('获取预设平台失败:', error);
      });
    },
    /** 查询平台列表 */
    getList(event) {
      if (event) {
        this.queryParams.pageNum = event.page;
        this.queryParams.pageSize = event.limit;
      }
      this.loading = true;
      listPlatform(this.queryParams).then(response => {
        this.platformList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.platformType = 'preset';
      this.form = {
        id: null,
        platformName: null,
        platformCode: null,
        icon: null,
        description: null,
        isPreset: 0,
        presetCode: null,
        selectedPreset: null,
        status: "0",
        sortOrder: 0,
        remark: null
      };
      this.resetForm("form");
    },

    /** 平台类型切换 */
    handlePlatformTypeChange(type) {
      // 清空表单中预设相关字段
      if (type === 'custom') {
        this.form.selectedPreset = null;
        this.form.isPreset = 0;
        this.form.presetCode = null;
      }
    },

    /** 预设平台选择变化 */
    handlePresetChange(presetCode) {
      const preset = this.presetPlatforms.find(p => p.code === presetCode);
      if (preset) {
        this.form.platformName = preset.name;
        this.form.platformCode = preset.code;
        this.form.presetCode = preset.code;
        this.form.icon = preset.iconUrl;
        this.form.isPreset = 1;
        this.form.description = `${preset.description} - 系统预设平台`;
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.platformType = 'preset';
      this.open = true;
      this.title = "添加AI平台";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getPlatform(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改AI平台";
      });
    },
    /** 状态切换操作 */
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.platformName + '"平台吗？').then(function() {
        return togglePlatformStatus(row.id);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updatePlatform(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPlatform(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除选中的平台数据？').then(function() {
        return delPlatform(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 查看配置按钮操作 */
    handleViewConfig(row) {
      // 存储选中的平台信息到sessionStorage
      sessionStorage.setItem('selectedPlatformId', row.id);
      sessionStorage.setItem('selectedPlatformName', row.platformName);
      // 跳转到API配置页面
      this.$router.push({
        path: '/aiPlatform/apiConfig',
        query: { platformId: row.id, platformName: row.platformName }
      });
    }
  }
};
</script>

<style scoped>
.help-block {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

/* 平台类型单选框样式 */
.radio-label {
  display: inline-flex;
  align-items: center;
}

.radio-label i {
  margin-right: 5px;
  font-size: 18px;
}

.radio-desc {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

/* 预设平台选项样式 */
.preset-option {
  display: flex;
  align-items: center;
  width: 100%;
}

.preset-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  border-radius: 4px;
}

.preset-name {
  flex: 1;
  font-weight: 500;
}

.preset-desc {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

/* 图标预览样式 */
.icon-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: contain;
}

/* 表格图标样式 */
.table-icon {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: contain;
  padding: 4px;
  border: 1px solid #ebeef5;
  background-color: #fff;
}

.table-icon-placeholder {
  font-size: 14px;
  color: #c0c4cc;
}

.icon-placeholder {
  font-size: 12px;
  color: #c0c4cc;
}

/* 预设提示列表样式 */
.preset-tips {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #606266;
}

.preset-tips li {
  margin-bottom: 5px;
  line-height: 1.5;
}
</style>
