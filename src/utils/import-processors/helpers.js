// src/utils/import-processors/helpers.js

/**
 * 将各种日期输入(字符串、Excel序列号)转换为 ISO 8601格式 (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param {string | number} dateInput
 * @returns {string} - 返回 ISO 格式的日期，或者 "" (空字符串)
 */
export function formatDateToISO(dateInput) {
  // 如果输入为空、"NA" 或 0，则返回 "" (空字符串)，以匹配 API 示例
  if (!dateInput || dateInput === 0 || String(dateInput).trim().toUpperCase() === 'NA' || String(dateInput).trim() === "") {
    return ""; 
  }

  let date;
  if (typeof dateInput === 'number') {
    // 假设是 Excel 序列日期 (从 1899-12-30 开始的天数)
    const excelEpoch = new Date(1899, 11, 30);
    date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
  } else if (typeof dateInput === 'string') {
    // 处理 "10/06/2022" 这种 mm/dd/yyyy 格式
    const trimmedDate = String(dateInput).trim();
    const parts = trimmedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (parts) {
      // ======================================================
      // 
      // 
      //  修改点 (FIXED):
      // 
      // 
      //  使用 Date.UTC() 
      // 
      // 
      //  来创建日期，
      // 
      // 
      //  
      // 
      // 
      //  使其免受本地时区偏移量的影响
      // 
      // 
      // 
      // 
      // 
      //  假设是 mm/dd/yyyy
      // 
      // 
      // 
      date = new Date(Date.UTC(parts[3], parts[1] - 1, parts[2]));
      // ======================================================
    } else {
      const parsed = Date.parse(dateInput);
      if (!isNaN(parsed)) {
        date = new Date(parsed);
      } else {
        console.warn(`无法解析的日期字符串: ${dateInput}`);
        return "";
      }
    }
  } else {
    return "";
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    console.warn(`转换日期时出错: ${dateInput}`);
    return "";
  }
  
  // 返回后端需要的 "date-time" 格式
  return date.toISOString();
}

/**
 * 清理单个值，确保其符合后端 DTO 的类型要求（0 或 ""）
 * @param {*} value - 单元格的原始值
 * @param {'number' | 'string'} expectedType - 期望的输出类型
 * @returns {string | number}
 */
export function cleanValue(value, expectedType) {
  const strVal = String(value).trim().toUpperCase();
  
  if (value === null || value === undefined || strVal === "" || strVal === "NA") {
    return expectedType === 'number' ? 0 : "";
  }
  
  if (expectedType === 'number') {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  
  return String(value);
}

/**
 * 将 CSV/Excel 表头（如 "Station ID"）转换为 "camelCase"（如 "stationId"）
 * @param {string} str
 * @returns {string}
 */
export function toCamelCase(str) {
  if (!str) return '';
  let s = String(str)
    // "ContractID" -> "Contract ID", "Station ID" -> "Station ID"
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') 
    // "cruiseName" -> "cruise Name"
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // "Station ID" -> "station id"
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .trim();
  
  // "station id" -> "stationId"
  return s.replace(/ (\w)/g, (m, c) => c.toUpperCase());
}