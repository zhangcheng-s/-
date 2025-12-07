<template>
  <div v-show="open" class="modal-overlay" @click="close">
    <div class="modal" @click.stop>
      <header class="modal-header">
        <h3>数据导入</h3>
        <button class="icon-btn close" @click="close">×</button>
      </header>

      <section class="upload-panel">
        <div class="panel-head">
          <i class="iconfont icon-aliupload"></i>
          <h4>文件选择</h4>
          <p class="hint">支持 .csv / .xlsx / .xls 文件。</p>
        </div>
        
        <div class="format-config">
          <div class="config-row">
            
            <div class="config-item half-width">
              <label for="data-type-select">数据类型:</label>
              <select id="data-type-select" v-model="selectedDataType" class="small-select">
                <option v-for="type in dataTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            
            <div class="config-item half-width">
              <label for="format-template">格式模板:</label>
              <select id="format-template" v-model="selectedTemplateId" class="small-select">
                <optgroup label="常用模板">
                  <option v-for="template in defaultTemplates" :key="template.id" :value="template.id">
                    {{ template.name }}
                  </option>
                </optgroup>
                <optgroup label="保存的模板" v-if="savedTemplates.length > 0">
                  <option v-for="template in savedTemplates" :key="template.id" :value="template.id">
                    {{ template.name }}
                  </option>
                </optgroup>
              </select>
            </div>
            
          </div> <div v-if="isCustomTemplate" class="config-item custom-inputs">
            <label>字段行: <input type="number" v-model.number="headerRowInput" min="1" class="row-input"></label>
            <label>数据始于行: <input type="number" v-model.number="dataStartRowInput" min="1" class="row-input"></label>
          </div>
          <div v-if="selectedTemplateId !== 'auto' && selectedTemplateId !== 'custom' && currentTemplate" class="config-item template-info">
            <span class="info-text">📋 表头行: {{ currentTemplate.headerRow }}, 数据起始行: {{ currentTemplate.dataStartRow }}</span>
            <button 
              v-if="currentTemplate.isSaved" 
              @click="confirmDeleteTemplate" 
              class="btn-small delete-btn"
              title="删除此模板"
            >
              🗑️ 删除
            </button>
          </div>
          
          <div class="config-item button-bar" v-if="rawSheetData.length > 0 || (isCustomTemplate && parsedData.length > 0)">
            <button 
              v-if="rawSheetData.length > 0" 
              @click="showRawPreview = true" 
              class="btn" 
              title="查看原始文件数据以确定行号"
            >
              🔎 原始预览
            </button>
            <button 
              v-if="isCustomTemplate && parsedData.length > 0" 
              @click="showSaveTemplateDialog = true" 
              class="btn save-template-btn"
              title="保存当前配置为模板"
            >
              💾 保存模板
            </button>
          </div>

        </div>
        
        <div v-if="showSaveTemplateDialog" class="save-template-dialog" @click="showSaveTemplateDialog = false">
          <div class="dialog-content" @click.stop>
            <h4>保存为模板</h4>
            <input 
              v-model="newTemplateName" 
              type="text" 
              placeholder="输入模板名称 (如: 水质监测表)" 
              class="template-name-input"
              @keyup.enter="confirmSaveTemplate"
              ref="templateNameInput"
            />
            <div class="dialog-actions">
              <button @click="confirmSaveTemplate" class="btn primary">保存</button>
              <button @click="showSaveTemplateDialog = false; newTemplateName = ''" class="btn">取消</button>
            </div>
          </div>
        </div>
        
        <div v-if="showRawPreview" class="raw-preview-modal" @click="showRawPreview = false">
          <div class="raw-preview-content" @click.stop>
            <h4>原始数据预览 (前 30 行)</h4>
            <p class="raw-hint">用于辅助查找正确的 "字段行" 和 "数据始于行"。</p>
            <div class="raw-table-wrapper">
              <table class="raw-table">
                <thead>
                  <tr>
                    <th class="raw-row-nr">行号</th>
                    <th v-for="(_, colIndex) in rawSheetData[0]" :key="colIndex">
                      {{ getColumnLetter(colIndex) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in rawSheetData.slice(0, 30)" :key="rowIndex">
                    <td class="raw-row-nr">{{ rowIndex + 1 }}</td>
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="dialog-actions">
              <button @click="showRawPreview = false" class="btn primary">关闭</button>
            </div>
          </div>
        </div>

        <div class="actions">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept=".csv,.xlsx,.xls"
            class="hidden-input"
          />
          <button @click="triggerFileInput" class="btn primary" :disabled="sending">
            选择文件
          </button>
          <button 
            v-if="parsedData.length > 0 && !sending" 
            @click="sendDataToBackend" 
            class="btn accent"
          >
            发送 {{ effectiveDataTypeName }} 数据
          </button>
          <button 
            v-if="parsedData.length > 0 && !sending" 
            @click="clearFile" 
            class="btn"
          >
            清除
          </button>
        </div>
        
        <div v-if="fileName" class="file-badge">
          <div class="file-badge-item file-name">
            已选择: <strong>{{ fileName }}</strong>
          </div>
          
          <div class="file-badge-item auto-detect-type" v-if="autoDetectedType && autoDetectedType !== 'other'">
            <span class="template-match auto-type">
              ✨ 自动识别: {{ dataTypes.find(t => t.id === autoDetectedType)?.name }}
            </span>
          </div>

          <div class="file-badge-item auto-match-template" v-if="currentTemplate && currentTemplate.isSaved">
            <span class="template-match template-file-match">
              🎯 已匹配模板: {{ currentTemplate.name }}
            </span>
          </div>
        </div>
        
        <div class="status-messages">
          <span v-if="error" class="error">{{ error }}</span>
          <span v-if="sending" class="sending">正在发送...</span>
        </div>
      </section>

      <section v-if="parsedData.length" class="preview-panel">
        <div class="panel-head">
          <i class="iconfont icon-alitable"></i>
          <h4>数据预览 (前 {{ previewCount }} 条)</h4>
        </div>
        <div class="table-wrapper">
          <div class="table-scroll" ref="scrollBox" @scroll="onScroll">
            <table>
              <colgroup></colgroup>
              <thead>
                <tr>
                  <th v-for="(v, k) in parsedData[0]" :key="k"><div class="th-inner" :title="k">{{ k }}</div></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in parsedData.slice(0, previewCount)" :key="i">
                  <td v-for="(v, k) in row" :key="k"><div class="cell" :title="String(v)">{{ v }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="scroll-shadow left" :class="{ show: scrolledLeft }"></div>
          <div class="scroll-shadow right" :class="{ show: scrolledRight }"></div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
// 
// 
//  (核心修改点) 
// 
// 
//  导入重构后的处理器
import { processors, genericProcessor } from '@/utils/import-processors';
import { uploadImportedData } from '@/api/management.js';

const props = defineProps({
  open: { type: Boolean, default: false }
});
const emit = defineEmits(['update:open', 'submitted']);

const fileInput = ref(null);
const fileName = ref('');
const parsedData = ref([]);
const previewCount = 10;
const templateNameInput = ref(null);

// 用于原始预览的 Ref
const rawSheetData = ref([]); // 存储原始的、未经处理的行数据 (数组的数组)
const showRawPreview = ref(false);

const formatTemplates = ref([
  { id: 'auto', name: '🔍 自动检测 (推荐)', headerRow: 1, dataStartRow: 2, isAuto: true },
  { id: 'standard', name: '标准表格 (表头第1行)', headerRow: 1, dataStartRow: 2 },
  { id: 'with_title', name: '带标题行 (表头第2行)', headerRow: 2, dataStartRow: 3 },
  { id: 'complex', name: '复杂表头 (表头第3-4行)', headerRow: 3, dataStartRow: 5 },
  { id: 'custom', name: '📝 自定义...', headerRow: 1, dataStartRow: 2 }
]);

// 
// 
//  (核心修改点) 
// 
// 
//  从导入的处理器动态生成 dataTypes
const dataTypes = ref([
  { id: 'auto', name: '✨ 自动检测类型' },
  ...processors.map(p => ({ id: p.id, name: p.name })),
  { id: 'other', name: '其他通用数据' }
]);

// 数据类型相关的状态
const selectedDataType = ref('auto'); // 用户在下拉框中的选择
const autoDetectedType = ref(null); // 'tow', 'point', 'chem', 'bio', 'other'

// 计算最终生效的数据类型
const effectiveDataType = computed(() => {
  if (selectedDataType.value === 'auto') {
    // 如果是自动模式，使用检测结果，如果检测失败则默认为 'other'
    return autoDetectedType.value || 'other';
  }
  // 否则，使用用户的手动选择
  return selectedDataType.value;
});

// 用于在按钮上显示名称
const effectiveDataTypeName = computed(() => {
  return dataTypes.value.find(t => t.id === effectiveDataType.value)?.name || '数据';
});


// 从 localStorage 加载用户保存的模板
function loadSavedTemplates() {
  try {
    const saved = localStorage.getItem('excel_templates');
    if (saved) {
      const templates = JSON.parse(saved);
      // 合并保存的模板到默认模板中
      const customTemplates = templates.filter(t => !['auto', 'standard', 'with_title', 'complex', 'custom'].includes(t.id));
      formatTemplates.value = [
        ...formatTemplates.value.slice(0, 4), // 保留前4个默认模板
        ...customTemplates, // 添加用户保存的模板
        formatTemplates.value[4] // 保留"自定义"选项在最后
      ];
    }
  } catch (e) {
    console.warn('加载保存的模板失败:', e);
  }
}

// 保存模板到 localStorage
function saveTemplate(name, headerRow, dataStartRow, fileName = '') {
  const newTemplate = {
    id: `saved_${Date.now()}`,
    name: `💾 ${name}`,
    headerRow,
    dataStartRow,
    fileName: fileName, // 用于智能匹配
    isSaved: true
  };
  
  // 插入到"自定义"之前
  const customIndex = formatTemplates.value.findIndex(t => t.id === 'custom');
  formatTemplates.value.splice(customIndex, 0, newTemplate);
  
  // 保存到 localStorage
  try {
    const toSave = formatTemplates.value.filter(t => t.isSaved);
    localStorage.setItem('excel_templates', JSON.stringify(toSave));
    console.log(`✅ 模板"${name}"已保存 (表头行: ${headerRow}, 数据起始行: ${dataStartRow})`);
  } catch (e) {
    console.error('保存模板失败:', e);
    alert('保存模板失败，请检查浏览器设置');
  }
}

// 删除已保存的模板
function deleteTemplate(templateId) {
  const index = formatTemplates.value.findIndex(t => t.id === templateId);
  if (index !== -1) {
    formatTemplates.value.splice(index, 1);
    try {
      const toSave = formatTemplates.value.filter(t => t.isSaved);
      localStorage.setItem('excel_templates', JSON.stringify(toSave));
    } catch (e) {
      console.error('删除模板失败:', e);
    }
  }
}

// 智能匹配文件名到模板
function findTemplateByFileName(fileName) {
  const lowerFileName = fileName.toLowerCase().replace(/\.(xlsx?|csv)$/i, ''); // 移除扩展名
  
  // 1. 精确匹配：文件名完全包含模板保存时的文件名
  for (const template of formatTemplates.value) {
    if (template.fileName && template.isSaved) {
      const savedFileName = template.fileName.toLowerCase().replace(/\.(xlsx?|csv)$/i, '');
      if (lowerFileName === savedFileName || lowerFileName.includes(savedFileName)) {
        console.log(`🎯 精确匹配: 文件"${fileName}" -> 模板"${template.name}"`);
        return template;
      }
    }
  }
  
  // 2. 模糊匹配：提取模板名称中的关键词进行匹配
  for (const template of formatTemplates.value) {
    if (template.isSaved) {
      // 移除emoji和特殊字符，提取纯文本名称
      const templateName = template.name.replace(/[💾🔍📝]/g, '').trim().toLowerCase();
      // 检查文件名是否包含模板名称关键词
      if (templateName && lowerFileName.includes(templateName)) {
        console.log(`🔍 模糊匹配: 文件"${fileName}" -> 模板"${template.name}" (关键词: ${templateName})`);
        return template;
      }
    }
  }
  
  console.log(`ℹ️ 未找到匹配的模板，将使用自动检测`);
  return null;
}

// 使用 computed 属性来分离模板列表
const defaultTemplates = computed(() => {
  return formatTemplates.value.filter(t => !t.isSaved);
});

const savedTemplates = computed(() => {
  return formatTemplates.value.filter(t => t.isSaved);
});


const selectedTemplateId = ref('auto');
const headerRowInput = ref(1);
const dataStartRowInput = ref(2);
const isCustomTemplate = computed(() => selectedTemplateId.value === 'custom');
const showSaveTemplateDialog = ref(false);
const newTemplateName = ref('');
const isParsingFile = ref(false); // 标志：正在解析文件，避免重复触发

// 初始化：加载保存的模板
loadSavedTemplates();

watch(selectedTemplateId, (newId) => {
  if (newId !== 'custom' && newId !== 'auto') {
    const template = formatTemplates.value.find(t => t.id === newId);
    if (template) {
      headerRowInput.value = template.headerRow;
      dataStartRowInput.value = template.dataStartRow;
      console.log(`📋 应用模板: ${template.name}, 表头行=${template.headerRow}, 数据起始行=${template.dataStartRow}`);
    }
    // 重新解析文件，使用模板配置而不是自动检测
    if (fileInput.value?.files?.[0]) {
      parseFile(fileInput.value.files[0], false);
    }
  } else if (newId === 'auto') {
    // 切换到自动检测模式，重新检测
    if (fileInput.value?.files?.[0]) {
      parseFile(fileInput.value.files[0], true);
    }
  }
});

watch([headerRowInput, dataStartRowInput], () => {
  // 如果正在解析文件，跳过（避免自动检测后重复解析）
  if (isParsingFile.value) {
    return;
  }
  
  if (isCustomTemplate.value && fileInput.value?.files?.[0]) {
    // 验证输入值
    if (headerRowInput.value < 1 || dataStartRowInput.value < 1) {
      error.value = '行号必须大于0';
      return;
    }
    if (headerRowInput.value >= dataStartRowInput.value) {
      error.value = '表头行必须小于数据起始行';
      return;
    }
    error.value = '';
    console.log(`✏️ 手动调整行号: 表头=${headerRowInput.value}, 数据起始=${dataStartRowInput.value}`);
    parseFile(fileInput.value.files[0], false);
  }
});

const scrollBox = ref(null);
const scrolledLeft = ref(false);
const scrolledRight = ref(false);
const sending = ref(false);
const error = ref('');

function close() { emit('update:open', false); }
function triggerFileInput() { fileInput.value?.click(); }
function clearFile() {
  fileName.value = '';
  parsedData.value = [];
  rawSheetData.value = []; // 清除时也要清空原始数据
  error.value = '';
  if (fileInput.value) fileInput.value.value = '';
  // 清除时重置模板和数据类型
  selectedTemplateId.value = 'auto';
  selectedDataType.value = 'auto';
  autoDetectedType.value = null;
  headerRowInput.value = 1;
  dataStartRowInput.value = 2;
}

function updateScrollShadow() {
  const el = scrollBox.value;
  if (!el) return;
  scrolledLeft.value = el.scrollLeft > 5;
  scrolledRight.value = el.scrollWidth > el.clientWidth && el.scrollLeft < el.scrollWidth - el.clientWidth - 5;
}
function onScroll() { updateScrollShadow(); }

function isRowEmpty(row) {
  if (!row) return true;
  return row.every(c => c === undefined || c === null || String(c).trim() === '');
}

function normalizeHeaderCell(v, idx) {
  const s = (v ?? '').toString().replace(/\r?\n/g, ' ').trim();
  return s || `Column_${idx + 1}`;
}

function zipObject(keys, values) {
  const obj = {};
  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = values?.[i] ?? '';
  }
  return obj;
}


// 
// 
//  (核心修改点) 
// 
// 
//  processDataForBackend 
// 
// 
//  现在委托给导入的处理器
/**
 * @param {Array<Object>} list - 
 * * PapaParse 
 * * 解析的原始数据 (e.g., { "Station ID": "..." })
 * @param {string} type - 
 * * 检测到的数据类型 (e.g., 'point', 'tow')
 * @returns {Array<Object>} - 
 * * 映射/转换后准备发往后端的数据
 */
function processDataForBackend(list, type) {
  // 
  // 
  //  1. 
  // 
  // 
  //  查找与所选类型匹配的处理器
  const processor = processors.find(p => p.id === type)?.processor;

  if (processor) {
    // 
    // 
    //  2. 
    // 
    // 
    //  如果找到匹配的（point, tow, ...），则使用其专用的
    // 
    // 
    // processor 
    // 
    // 
    //  函数
    return processor(list);
  } else {
    // 
    // 
    //  3. 
    // 
    // 
    //  如果没有找到（例如类型是 'other'），则使用通用的处理器
    console.warn(`未找到类型 "${type}" 的专用处理器，将使用通用处理器。`);
    return genericProcessor(list);
  }
}


// 增强的智能检测算法
function autoDetectHeader(rows) {
  if (!rows || rows.length === 0) {
    return { headerRow: 1, dataStartRow: 2, confidence: 0 };
  }

  const MIN_HEADER_COLUMNS = 3;
  const MAX_SEARCH_ROWS = 20;
  let bestHeaderIndex = -1;
  let bestScore = -1;
  let dataStartIndex = -1;

  console.log('🔍 开始智能检测表头...');
  
  // 1. 遍历前20行，为每一行打分
  for (let i = 0; i < Math.min(rows.length, MAX_SEARCH_ROWS); i++) {
    const row = rows[i];
    if (isRowEmpty(row)) continue;

    let score = 0;
    const nonEmptyCells = row.filter(cell => {
      const str = String(cell || '').trim();
      return str !== '';
    });

    // 如果列数太少，跳过
    if (nonEmptyCells.length < MIN_HEADER_COLUMNS) continue;

    // 评分规则1: 非空单元格数量 (越多越好)
    score += nonEmptyCells.length * 2;

    // 评分规则2: 文本类型占比 (表头通常是文本)
    const textCells = nonEmptyCells.filter(cell => {
      const str = String(cell).trim();
      return isNaN(str) || str.length > 10; // 长文本或非数字
    });
    const textRatio = textCells.length / nonEmptyCells.length;
    score += textRatio * 20;

    // 评分规则3: 唯一性 (表头通常不重复)
    const uniqueCells = new Set(nonEmptyCells.map(c => String(c).trim().toLowerCase()));
    const uniqueRatio = uniqueCells.size / nonEmptyCells.length;
    score += uniqueRatio * 15;

    // 评分规则4: 包含常见表头关键词
    const headerKeywords = ['id', 'name', 'type', '名称', '类型', '编号', 'date', '日期', 'number', 'code', 'status', '状态'];
    const hasKeywords = nonEmptyCells.some(cell => {
      const str = String(cell).toLowerCase();
      return headerKeywords.some(kw => str.includes(kw));
    });
    if (hasKeywords) score += 10;

    // 评分规则5: 位置加权 (靠前的行更可能是表头，但不是第一行的标题行)
    if (i === 0) {
      // 第一行可能是大标题，降低分数
      const firstCell = String(row[0] || '').trim();
      if (firstCell.length > 20 || nonEmptyCells.length < row.length * 0.5) {
        score -= 10; // 很可能是标题行
      }
    } else if (i === 1 || i === 2) {
      score += 5; // 第2-3行更可能是表头
    }

    console.log(`  行 ${i + 1}: 分数=${score.toFixed(1)}, 非空=${nonEmptyCells.length}, 文本率=${(textRatio * 100).toFixed(0)}%, 唯一率=${(uniqueRatio * 100).toFixed(0)}%`);

    if (score > bestScore) {
      bestScore = score;
      bestHeaderIndex = i;
    }
  }

  // 2. 找到表头后，检测数据起始行
  if (bestHeaderIndex !== -1) {
    dataStartIndex = bestHeaderIndex + 1;
    
    // 跳过表头后的空行和可能的二级表头
    for (let i = bestHeaderIndex + 1; i < Math.min(rows.length, bestHeaderIndex + 5); i++) {
      const row = rows[i];
      if (isRowEmpty(row)) {
        dataStartIndex = i + 1;
        continue;
      }
      
      // 检查是否是数据行 (包含数字或实际数据)
      const nonEmptyCells = row.filter(cell => String(cell || '').trim() !== '');
      const numericCells = nonEmptyCells.filter(cell => {
        const str = String(cell).trim();
        return !isNaN(str) && str !== '';
      });
      
      // 如果这行有较多数字，认为是数据行
      if (numericCells.length > 0 || nonEmptyCells.length > 0) {
        dataStartIndex = i;
        break;
      }
    }
  }

  const result = {
    headerRow: bestHeaderIndex !== -1 ? bestHeaderIndex + 1 : 1,
    dataStartRow: dataStartIndex !== -1 ? dataStartIndex + 1 : (bestHeaderIndex !== -1 ? bestHeaderIndex + 2 : 2),
    confidence: bestScore > 0 ? Math.min(100, bestScore) : 0
  };

  console.log(`✅ 检测结果: 表头行=${result.headerRow}, 数据起始行=${result.dataStartRow}, 置信度=${result.confidence.toFixed(1)}`);
  
  return result;
}

// 
// 
//  (核心修改点) 
// 
// 
//  根据表头自动检测数据类型
function autoDetectDataType(headers) {
  if (!headers || headers.length === 0) return null;
  
  // 
  // 
  //  (修复点) 
  // 
  // 
  //  检测时使用【原始表头】
  const rawHeaders = new Set(headers.map(h => String(h)));
  console.log('🔍 正在检测数据类型，已处理表头:', rawHeaders);

  let bestMatch = { id: 'other', score: 0 };

  // 
  // 
  //  (修改点) 
  // 
  // 
  //  循环遍历所有导入的处理器
  for (const processor of processors) {
    let score = 0;
    // 
    // 
    //  检查该处理器的指纹
    for (const key of processor.fingerprint) {
      if (rawHeaders.has(key)) {
        score++;
      }
    }
    
    // 
    // 
    //  (修改点) 
    // 
    // 
    //  使用【原始 CSV 表头】作为指纹
    const threshold = 8; // 
    
    
    // (e.g., 
    
    
    // 至少 8 
    
    
    // 个指纹字段匹配)
    if (score >= threshold && score > bestMatch.score) {
      bestMatch = { id: processor.id, score: score };
    }
  }

  console.log(`✅ 检测到：${bestMatch.id} (匹配得分: ${bestMatch.score})`);
  return bestMatch.id;
}


function handleFileChange(e) {
  error.value = '';
  const file = e.target.files?.[0];
  if (!file) return;
  fileName.value = file.name;
  
  console.log(`📁 文件上传: ${file.name}`);

  // 
  // 
  //  重置数据类型检测，强制重新检测
  selectedDataType.value = 'auto';
  autoDetectedType.value = null;
  
  // 智能匹配：总是尝试查找匹配的模板
  const matchedTemplate = findTemplateByFileName(file.name);
  
  if (matchedTemplate) {
    // 1. 找到匹配的模板，自动切换并应用
    console.log(`✅ 自动应用匹配的模板: ${matchedTemplate.name}`);
    selectedTemplateId.value = matchedTemplate.id;
    headerRowInput.value = matchedTemplate.headerRow;
    dataStartRowInput.value = matchedTemplate.dataStartRow;
    parseFile(file, false); // 使用模板设置进行解析
  } else {
    // 2. Bug修复：没有匹配模板，强制重置为自动检测
    console.log(`ℹ️ 未匹配到模板，重置为自动检测模式`);
    selectedTemplateId.value = 'auto'; // 强制重置
    // 注意：这里不需要设置 headerRowInput 和 dataStartRowInput
    // 它们将由 parseFile(autoDetect=true) 内部的 autoDetectHeader 自动设置
    parseFile(file, true); // 使用自动检测进行解析
  }
}

// 一个辅助函数，用于显示Excel的列名 (A, B, C...)
function getColumnLetter(colIndex) {
  let letter = '';
  let temp = colIndex;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

function parseFile(file, autoDetect = false) {
  isParsingFile.value = true; // 开始解析
  
  // 在解析完成后，立即进行数据类型检测
  const onParseComplete = (data, headers = []) => {
    parsedData.value = data;
    
    // 在数据加载后立即检测类型
    if (headers.length > 0) {
      const detected = autoDetectDataType(headers);
      autoDetectedType.value = detected; // 存储 "纯粹" 的检测结果
      
      // 
      // 
      //  (核心逻辑 - 自动同步下拉菜单) 
      // 
      // 
      // 
      // 
      //  如果用户当前处于 "auto" 模式，则将下拉菜单同步更新为检测到的类型
      if (selectedDataType.value === 'auto') {
        selectedDataType.value = detected || 'other';
      }
    }
    
    nextTick(() => {
      updateScrollShadow();
      adjustColumnWidths();
      isParsingFile.value = false; // 解析完成
    });
  };

  if (file.name.toLowerCase().endsWith('.csv')) {
    // CSV 的原始预览比较特殊，因为它没有行号概念，且PapaParse的`header: true`会吃掉行
    // 为保持功能统一，我们用 header: false 先读一次原始数据
    const rawReader = new FileReader();
    rawReader.onload = (e) => {
      Papa.parse(e.target.result, {
        header: false,
        skipEmptyLines: false,
        complete: (res) => {
          rawSheetData.value = res.data; // 填充原始数据
        }
      });
    };
    rawReader.readAsText(file); // 假设是UTF-8，如果不是，这里会乱码

    // 正常解析数据
    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: res => {
        const headers = res.meta.fields || [];
        const filtered = res.data.filter(r => Object.values(r).some(v => String(v).trim() !== ''));
        onParseComplete(filtered, headers); // 
        
        
        // 传入 headers
      },
      error: () => { error.value = 'CSV 解析失败'; isParsingFile.value = false; }
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = new Uint8Array(ev.target.result);
      const wb = XLSX.read(data, { type: 'array', raw: false });
      const ws = wb.Sheets[wb.SheetNames[0]];

      // 始终使用 header: 1 来获取原始的二维数组
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: true });
      
      // 填充原始数据以供预览
      rawSheetData.value = rows;

      if (autoDetect) {
        console.log('🔍 执行自动检测...');
        const detected = autoDetectHeader(rows);
        headerRowInput.value = detected.headerRow;
        dataStartRowInput.value = detected.dataStartRow;
        
        // 自动检测后切换到custom模式，让用户可以微调
        if (selectedTemplateId.value === 'auto') {
          // 临时禁用watch避免重复解析
          selectedTemplateId.value = 'custom';
        }
        
        // 如果置信度低，提示用户
        if (detected.confidence < 30) {
          console.warn(`⚠️ 检测置信度较低 (${detected.confidence.toFixed(1)}), 建议手动检查`);
          error.value = `自动检测置信度较低 (${detected.confidence.toFixed(0)}%)，请检查表头和数据行是否正确`;
        } else {
          console.log(`✅ 自动检测完成，置信度: ${detected.confidence.toFixed(1)}%`);
        }
      }

      const headerRowIndex = headerRowInput.value - 1;
      const dataStartRowIndex = dataStartRowInput.value - 1;

      console.log('📊 解析配置:');
      console.log('  - 表头行号(1-based):', headerRowInput.value, '=> 索引:', headerRowIndex);
      console.log('  - 数据起始行号(1-based):', dataStartRowInput.value, '=> 索引:', dataStartRowIndex);
      console.log('  - Excel总行数:', rows.length);
      console.log('  - 表头行内容:', rows[headerRowIndex]);
      console.log('  - 第一条数据行内容:', rows[dataStartRowIndex]);

      if (headerRowIndex < 0 || dataStartRowIndex < 0 || headerRowIndex >= dataStartRowIndex) {
        error.value = '行号配置错误：字段行必须小于数据起始行。';
        parsedData.value = [];
        isParsingFile.value = false;
        return;
      }
      
      if (!rows || rows.length <= headerRowIndex) {
        parsedData.value = [];
        isParsingFile.value = false;
        return;
      }

      const headerRow = rows[headerRowIndex] || [];
      const headers = headerRow.map(normalizeHeaderCell);
      console.log('  - 解析后的表头:', headers);
      
      const merged = [];
      for (let r = dataStartRowIndex; r < rows.length; r++) {
        const row = rows[r];
        if (isRowEmpty(row)) continue;
        merged.push(zipObject(headers, row));
      }
      console.log('  - 解析数据条数:', merged.length);
      if (merged.length > 0) {
        console.log('  - 第一条数据示例:', merged[0]);
      }
      
      onParseComplete(merged, headers); // 
      
      
      // 传入 headers
    } catch (e) {
      console.error("解析Excel时出错:", e);
      error.value = 'Excel 解析失败，请检查文件格式或行号配置。';
      rawSheetData.value = []; // 出错时清空
      isParsingFile.value = false;
    }
  };
  reader.readAsArrayBuffer(file);
}

function adjustColumnWidths() {
  const table = scrollBox.value?.querySelector('table');
  if (!table || !parsedData.value.length) return;

  const headers = Object.keys(parsedData.value[0]);
  const colgroup = table.querySelector('colgroup');
  if (!colgroup) return;
  
  colgroup.innerHTML = '';

  headers.forEach(() => {
    const col = document.createElement('col');
    col.style.minWidth = '120px';
    col.style.width = '150px';
    colgroup.appendChild(col);
  });
}

// 计算当前选中的模板
const currentTemplate = computed(() => {
  return formatTemplates.value.find(t => t.id === selectedTemplateId.value);
});

// 监听对话框显示，自动聚焦输入框
watch(showSaveTemplateDialog, (newVal) => {
  if (newVal) {
    // 自动填充文件名 (并移除 .xlsx, .xls, .csv 扩展名)
    newTemplateName.value = fileName.value.replace(/\.(xlsx?|csv)$/i, '');
    
    nextTick(() => {
      // 不仅要 focus()，还要 select() 来全选
      templateNameInput.value?.focus();
      templateNameInput.value?.select();
    });
  } else {
    // (可选但推荐) 关闭时清空，防止下次打开残留
    newTemplateName.value = '';
  }
});

// 确认保存模板
function confirmSaveTemplate() {
  const name = newTemplateName.value.trim();
  if (!name) {
    alert('请输入模板名称');
    return;
  }
  
  // 检查是否已存在同名模板
  const exists = formatTemplates.value.some(t => t.name.includes(name) && t.isSaved);
  if (exists) {
    if (!confirm(`已存在名为"${name}"的模板，是否覆盖？`)) {
      return;
    }
    // 删除旧模板
    const oldTemplate = formatTemplates.value.find(t => t.name.includes(name) && t.isSaved);
    if (oldTemplate) {
      deleteTemplate(oldTemplate.id);
    }
  }
  
  saveTemplate(name, headerRowInput.value, dataStartRowInput.value, fileName.value);
  
  // 切换到新保存的模板
  nextTick(() => {
    const newTemplate = formatTemplates.value.find(t => t.name.includes(name) && t.isSaved);
    if (newTemplate) {
      selectedTemplateId.value = newTemplate.id;
    }
  });
  
  showSaveTemplateDialog.value = false;
  newTemplateName.value = '';
}

// 确认删除模板
function confirmDeleteTemplate() {
  const templateName = currentTemplate.value?.name || '';
  if (confirm(`确定要删除模板"${templateName}"吗？\n删除后将无法恢复。`)) {
    deleteTemplate(selectedTemplateId.value);
    selectedTemplateId.value = 'auto';
    alert('模板已删除');
  }
}

// 
// 
//  (核心修改点) 
// 
// 
//  修改 sendDataToBackend 函数以使用正确的 API 路径
async function sendDataToBackend() {
  if (!parsedData.value.length) { error.value = '没有数据'; return; }
  error.value = '';
  sending.value = true;
  
  // 
  // 
  //  1. 
  // 
  // 
  //  获取当前生效的数据类型
  const type = effectiveDataType.value;
  
  // 
  // 
  //  2. 
  // 
  // 
  //  将类型传入 processDataForBackend
  const items = processDataForBackend(parsedData.value, type);
  
  console.log(`🚀 准备发送数据: 类型=${type}, 条数=${items.length}`);
  if (items.length > 0) {
    console.log('第一条数据示例 (映射后):', items[0]);
  }

  try {
    let response;
    // 
    // 
    //  3. 
    // 
    // 
    //  根据类型选择不同的 API 函数
    // 
    // 
    //  (修改点) 
    // 
    // 
    //  查找处理器并调用其 apiFunction
    const processor = processors.find(p => p.id === type);

    if (processor && processor.apiFunction) {
      response = await processor.apiFunction(items);
    } else {
      // 
      // 
      //  Fallback 
      // 
      // 
      //  (用于 'other')
      console.log('...作为 "其他通用数据" 发送');
      response = await uploadImportedData({ items }); // "其他" 
      
      
      // (假设) 
      
      
      //  期望 {items: ...}
    }
    
    // 
    // 
    //  4. 
    // 
    // 
    //  统一处理成功响应
    const submittedCount = response?.count || items.length;
    emit('submitted', { count: submittedCount });
    alert(`发送成功：${submittedCount} 条 (${effectiveDataTypeName.value})`);
    clearFile();
    close();

  } catch (e) {
    console.error(`发送失败 (${type}):`, e);
    // 
    // 
    //  显示来自 postRequest 的更详细的错误
    error.value = `发送失败: ${e.message || '请检查网络或后端接口'}`;
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
/* (新增) 
 Row layout for Data Type and Template 
*/
.config-row {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping on small screens */
  gap: 12px;
  width: 100%;
}
.config-item.half-width {
  flex: 1;
  min-width: 250px; /* Min width before wrapping */
  /* .config-item already has display:flex */
}
.config-item.half-width label {
  flex-shrink: 0;
}
.config-item.half-width .small-select {
  flex-grow: 1;
  width: 100%; /* Take remaining space */
}

/* (移除) 
 Old auto-detect badge style 
*/
/*
.auto-detect-badge {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  color: #0050b3;
}
.auto-detect-badge strong {
  font-weight: 600;
}
*/


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal {
  width: min(960px, 92vw);
  max-height: 88vh;
  /* overflow: auto; */
  /* 改为flex布局，让内容区滚动 */
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,.2);
  padding: 16px 18px 18px;
}
.modal-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.modal-header h3 {
  margin:0;
  font-size:18px;
  font-weight:700;
  color:#24446b;
}
.icon-btn.close {
  border:none;
  background:#f2f2f2;
  width:28px;
  height:28px;
  border-radius:6px;
  cursor:pointer;
  font-size:18px;
}
.icon-btn.close:hover { background:#e8e8e8; }

.upload-panel {
  background: #fafbff;
  border:1px solid #e8edf7;
  border-radius:8px; padding:14px;
  margin:10px 0;
  flex-shrink: 0;
}
.preview-panel {
  background: #fafbff;
  border:1px solid #e8edf7;
  border-radius:8px; padding:14px;
  margin:10px 0 0; 
  /* 预览区可滚动 */
  flex-grow: 1;
  min-height: 250px; 
  display: flex;
  flex-direction: column;
}

.panel-head {
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:8px;
}
.panel-head h4 {
  margin:0;
  font-size:15px;
  font-weight:600;
}
.hint {
  font-size:12px;
  color:#666;
  margin: 0; 
}
.actions { display:flex; gap:10px; flex-wrap:wrap; }
.hidden-input { display:none; }
.btn { 
  border:1px solid #dcdfe6; 
  background:#fff; 
  padding:8px 16px; 
  border-radius:6px; 
  cursor:pointer;
  transition: all 0.2s;
}
.btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.primary { background:#1677ff; color:#fff; border-color:#1677ff; }
.btn.accent { background:#ff7d36; color:#fff; border-color:#ff7d36; }

/* (修改点) 
 Badge layout 
*/
.file-badge { 
  margin-top:8px; 
  background:#f2f6ff; 
  border:1px solid #e0ecff; 
  padding:8px 12px; 
  border-radius:6px; 
  font-size:12px; 
  color:#24446b; 
  display: flex; /* (Modified) 
 */
  gap: 12px; /* (New) 
 */
  align-items: center; /* (New) 
 */
  flex-wrap: wrap; /* (New) 
 */
}

/* .file-badge-item {
  
} */

/* (修改点) 
 Template match badge base style 
*/
.template-match {
  display: inline-block;
  /* margin-left: 12px; (Removed) 
 */
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid;
}

/* (新增) 
 Auto-Detect Type Badge (Blue) 
*/
.template-match.auto-type {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #0050b3;
}

/* (新增) 
 Auto-Match Template Badge (Green) 
*/
.template-match.template-file-match {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #389e0d;
}


.table-wrapper { 
  position:relative; 
  border:1px solid #e1e5eb; 
  border-radius:8px; 
  overflow:hidden; 
  /* 关键：让表格包装器占满剩余空间 */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.table-scroll { 
  overflow:auto; 
  /* max-height:420px; */ /* 移除固定高度，使其自适应 */
  flex-grow: 1;
}
table {
  width: auto;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
}
thead th {
  position:sticky;
  top:0;
  background:#f0f3f8;
  font-weight:600;
  padding:0;
  border-bottom:1px solid #d5dae0;
  white-space:nowrap;
  z-index:2;
}
tbody td { padding:0; border-bottom:1px solid #eef1f4; background:#fff; white-space:nowrap; }
tbody tr:nth-child(even) td { background:#fafbfd; }
tbody tr:hover td { background:#f0f7ff; }
.th-inner, .cell { padding:8px 12px; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.scroll-shadow { position:absolute; top:0; bottom:0; width:40px; pointer-events:none; opacity:0; transition:opacity .25s; z-index:3; }
.scroll-shadow.left { left:0; background:linear-gradient(to right, rgba(240,243,248,.8), transparent); }
.scroll-shadow.right { right:0; background:linear-gradient(to left, rgba(240,243,248,.8), transparent); }
.scroll-shadow.show { opacity:1; }


.format-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fdfdff;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  border: 1px solid #e8edf7;
}
.config-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  flex-wrap: wrap; 
}
.config-item label {
  white-space: nowrap;
}

.custom-inputs {
  gap: 15px;
}
.small-select, .row-input {
  padding: 5px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}
.small-select {
  min-width: 220px;
  flex-grow: 1; 
}
.row-input {
  width: 80px;
}

.btn-small {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-small:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}
.save-template-btn {
  background: #e7f4ff;
  border-color: #91d5ff;
  color: #0050b3;
}
.save-template-btn:hover {
  background: #bae7ff;
}
.delete-btn {
  background: #fff2f0;
  border-color: #ffccc7;
  color: #cf1322;
}
.delete-btn:hover {
  background: #ffccc7;
}

.template-info {
  color: #666;
  font-size: 13px;
}
.info-text {
  margin-right: 8px;
}

/* 按钮条和内部按钮的样式 */
.config-item.button-bar {
  margin-top: 8px; /* 与上方的输入框拉开距离 */
  gap: 12px;      /* 按钮之间的间距 */
}
.config-item.button-bar .btn {
  min-width: 120px;
  text-align: center;
}

.status-messages {
  margin-top: 10px;
  font-size: 12px;
  /* ✨ 修改点: 移除了 min-height，让它在没有内容时高度为0 
  */
  /* min-height: 1.2em; */ 
}
.status-messages .error { 
  color: #d93025; 
}
.status-messages .sending { 
  color: #1677ff; 
}


.save-template-dialog {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}
.dialog-content {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
  min-width: 350px;
}
.dialog-content h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #262626;
}
.template-name-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
  box-sizing: border-box;
}
.template-name-input:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, .2);
}
.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 原始数据预览模态框样式 */
.raw-preview-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000; /* 必须比主模态框高 */
}
.raw-preview-content {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
  width: min(960px, 95vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.raw-preview-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #262626;
}
.raw-hint {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px;
}
.raw-table-wrapper {
  overflow: auto; /* 关键：使表格可滚动 */
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  flex-grow: 1; /* 占据剩余空间 */
  min-height: 300px; /* 给一个最小高度 */
}
.raw-table {
  width: auto; /* 自动宽度 */
  min-width: 100%; /* 至少撑满 */
  border-collapse: collapse;
  font-size: 12px;
}
.raw-table th, .raw-table td {
  border: 1px solid #f0f0f0;
  padding: 6px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px; /* 单元格最大宽度 */
}
.raw-table th {
  background: #fafafa;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 2;
  min-width: 80px; /* 列最小宽度 */
}
/* 行号列 */
.raw-table .raw-row-nr {
  font-weight: 700;
  color: #8c8c8c;
  background: #f8f9fa;
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 60px;
  text-align: center;
  /* 左上角单元格的z-index最高 */
  thead & {
    z-index: 3;
  }
}
.raw-table tbody .raw-row-nr {
  z-index: 1;
  background: #fdfdfd;
}
.raw-preview-content .dialog-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>