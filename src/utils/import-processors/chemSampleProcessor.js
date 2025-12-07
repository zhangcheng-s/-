// src/utils/import-processors/chemSampleProcessor.js

import { uploadChemData } from '@/api/management.js';
import { formatDateToISO } from './helpers.js';

export const name = "化学数据";
export const id = "chem";
export const apiFunction = uploadChemData;

// Excel 文件的列名指纹（用于自动识别）
export const fingerprint = [
  'Sample ID', 'Category', 'Analysis', 'Result', 'Units',
  'CTD_Depth', 'CTD_SampleDate', 'LOD', 'Analytical Technique',
  'Instrument', 'Lab Matrix', 'Total or Dissolved', 'Measurement Basis',
  'Laboratory', 'Remarks'
];

/**
 * 化学数据处理器
 * 将 Excel 列名映射到后端 JSON 字段名
 */
export function processor(list) {
  console.log("Processing chem data, 原始数据行数:", list.length);

  // Excel 列名 → 后端 JSON 字段名的映射
  const columnMapping = {
    "Sample ID": "sampleName",
    "Category": "category",
    "Analysis": "analysis",
    "Result": "analysisResult",
    "Units": "units",
    "CTD_Depth": "ctdDepth",
    "CTD_SampleDate": "ctdSampleDate",
    // "Qualifier" 不映射，自动忽略
    "LOD": "lod",
    "Analytical Technique": "analyticalTechnique",
    "Instrument": "instrument",
    "Lab Matrix": "labMatrixName",
    "Total or Dissolved": "totalOrDissolved",
    "Measurement Basis": "measurementBasis",
    "Laboratory": "laboratory",
    "Remarks": "remarks"
  };

  // 处理每一行数据
  const processed = list.map((row, index) => {
    const processedRow = {};

    // 定义一个包含所有字段的默认值对象，确保结构完整
    const defaultRow = {
      sampleName: null,
      ctdDepth: 0,
      ctdSampleDate: null,
      lod: 0,
      analyticalTechnique: null,
      instrument: null,
      labMatrixName: null,
      totalOrDissolved: null,
      measurementBasis: null,
      laboratory: null,
      remarks: null,
      category: null,
      analysis: null,
      analysisResult: null,
      units: null
    };

    // 遍历原始数据的每一列
    for (const excelColumn in row) {
      // 获取对应的 JSON 字段名
      const jsonKey = columnMapping[excelColumn];

      // 如果没有映射关系（如 Qualifier），跳过该列
      if (!jsonKey) {
        continue;
      }

      let value = row[excelColumn];

      // 跳过空值
      if (value === null || value === undefined || value === "") {
        continue;
      }

      // 根据字段类型进行数据转换
      try {
        if (jsonKey === "ctdSampleDate") {
          // 日期格式化为 ISO-8601: YYYY-MM-DD
          value = formatDateToISO(value);
          if (!value) continue; // 无效日期跳过
        }
        else if (jsonKey === "ctdDepth" || jsonKey === "lod") {
          // 数字类型转换（m 单位，空缺为 0）
          value = parseFloat(String(value).replace(/[^\d.-]/g, ''));
          if (isNaN(value)) {
            value = 0; // 无效数字设为 0
          }
        }
        else if (jsonKey === "analysisResult") {
          // 处理 Result 字段：ND、<LOD 等特殊值设为 null
          const str = String(value).trim().toUpperCase();
          if (str.includes('ND') || str.includes('<LOD') || str === '') {
            value = null;
          } else {
            // 尝试提取数字
            const match = String(value).match(/[\d.]+/);
            if (match) {
              const num = parseFloat(match[0]);
              if (!isNaN(num)) {
                value = num;
              }
            }
          }
        }
        else {
          // 字符串类型，去除首尾空格
          value = String(value).trim();
        }

        // 添加到处理后的数据中
        processedRow[jsonKey] = value;
      } catch (error) {
        console.warn(`第 ${index + 1} 行，列 ${excelColumn} 处理失败:`, error);
      }
    }

    // 使用默认值对象合并处理后的行，确保所有字段都存在
    return Object.assign(defaultRow, processedRow);
  });

  console.log("处理后的数据:", processed);
  console.log("第一条数据示例:", processed[0]);

  return processed;
}