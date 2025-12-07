// src/utils/import-processors/index.js

import * as point from './pointSampleProcessor.js';
import * as tow from './towSampleProcessor.js';
import * as chem from './chemSampleProcessor.js';
import * as bio from './bioSampleProcessor.js';
import { toCamelCase } from './helpers.js';

// 
// 
//  将所有处理器模块聚合到一个数组中
export const processors = [
  point,
  tow,
  chem,
  bio
];

// 
// 
//  为 "其他通用数据" 提供一个默认处理器
export const genericProcessor = (list) => {
  return list.map(row => {
    const baseRow = {};
    for (const key in row) {
      baseRow[toCamelCase(key)] = row[key] ?? "";
    }
    return baseRow;
  });
};