// 模拟API接口

// 检查是否支持视觉模型
export const canVisionModel = (model) => {
  const visionModels = ['gpt-4-vision-preview', 'gpt-4v'];
  return visionModels.includes(model);
};

// 上传文件到GPT
export const GptUploader = async (url, formData) => {
  // 模拟上传延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟上传成功返回
  return {
    url: 'https://example.com/uploads/image.jpg',
    error: null
  };
};

// 日志函数
export const mlog = (...args) => {
  console.log(...args);
};

// 上传图片
export const upImg = async (file) => {
  // 模拟上传延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟上传成功返回
  return {
    url: 'https://example.com/uploads/image.jpg'
  };
};

// 从剪贴板获取文件
export const getFileFromClipboard = (event) => {
  const items = Array.from(event.clipboardData.items);
  return items
    .filter(item => item.kind === 'file')
    .map(item => item.getAsFile());
};

// 检查是否为MP3文件
export const isFileMp3 = (filename) => {
  return /\.mp3$/i.test(filename);
};

// 计算tokens
export const countTokens = async (messages, input, chatId) => {
  // 模拟计算延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟返回结果
  return {
    remain: 2000,
    modelTokens: '4k'
  };
};

// 检查是否禁用GPT4
export const checkDisableGpt4 = (model) => {
  return model?.toLowerCase().includes('gpt-4') && false; // 模拟始终允许GPT4
};

// 语音识别类
export class Recognition {
  constructor() {
    this.isRecording = false;
  }

  start() {
    this.isRecording = true;
  }

  stop() {
    this.isRecording = false;
  }
}

// 聊天设置类
export class chatSetting {
  constructor(chatId) {
    this.chatId = chatId;
  }

  getGptConfig() {
    return {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemMessage: '你是一个有帮助的助手。'
    };
  }
}