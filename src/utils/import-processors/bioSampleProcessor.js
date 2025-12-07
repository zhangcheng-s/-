// src/utils/import-processors/bioSampleProcessor.js
// 
// 
//  (最终修正版：结合了健壮的表头归一化和正确的类型映射)
// 
// 

import { uploadBioData } from '@/api/management.js';
import { formatDateToISO } from './helpers.js';

export const name = "生物数据";
export const id = "bio";
export const apiFunction = uploadBioData;

// 根据生物数据 Excel 文件更新指纹 (来自您的 15:37 版本)
export const fingerprint = [
  'Sample ID', 'OrgNum', 'Kingdom', 'Phylum', 'Class',
  'Scientific Name', 'Identification Date', 'Number of individuals', 'Life Stage', 'Sex'
];

/**
 * 归一化列头：去大小写差异、下划线/连字符、百分号/问号、括号内容等
 * 这是解决“脆弱映射”的关键。
 */
function norm(h) {
  return String(h || '')
    .replace(/\uFEFF/g, '') // 移除 BOM
    .toLowerCase()
    .replace(/\((.*?)\)/g, '') // 去括号内容，如 (LSID)
    .replace(/[%?]/g, '') // 去 % 和 ?
    .replace(/[_-]+/g, ' ') // _ 或 - 变空格
    .replace(/\s+/g, ' ') // 合并空格
    .trim();
}

/**
 * 健壮的列头别名(归一化后) → 后端 DTO 字段
 * 键 (key) 是 norm() 函数处理后的结果。
 */
const headerMap = {
  // 关键
  'sample id': 'sampleName',
  'orgnum': 'orgnum',

  // 分类
  'kingdom': 'taxaKingdom',
  'phylum': 'taxaPhylum',
  'class': 'taxaClass',
  'order': 'taxaOrder',
  'family': 'taxaFamily',
  'subfamily': 'taxaSubfamily',
  'genus': 'taxaGenus',
  'species': 'taxaSpecies',
  'taxonomic author citation': 'taxonomicAuthorCitation',
  'scientific name': 'scientificName',
  'morphotype': 'morphotype',
  'taxonomic identification qualifier': 'taxonomicIdentificationQualifier',
  'notes on taxonomic identification': 'notesOnTaxonomicIdentification',
  'identification method': 'identificationMethod',
  'identification date': 'identificationDate',
  'identification status': 'identificationStatus',

  // 生态学 (带 % 的列头，norm() 会自动处理)
  'total biomass collected': 'totalBiomassCollected',
  'total biomass units': 'totalBiomassUnits',
  'nominal size category': 'nominalSizeCategory',
  'number of individuals': 'numberOfIndividuals',
  'relative abundance': 'relativeAbundance',
  'relative dominance': 'relativeDominance',
  'taxon density': 'taxonDensity',
  'taxon density units': 'taxonDensityUnits',
  'additional notes about ecology': 'additionalNotesAboutEcology',

  // 生物个体
  'life stage': 'lifeStage',
  'sex': 'sex',
  'reproductive state': 'reproductiveState',
  'associated taxa': 'associatedTaxa',
  'additional notes about organism collected': 'additionalNotesAboutOrganism',

  // 影像
  'photo file name': 'photoFileName',
  'video frame code': 'videoFrameCode',
  'video photo frame file name': 'videoPhotoFrameFileName',

  // 数据库/Voucher (带 (LSID) 的列头，norm() 会自动处理)
  'taxonomic database': 'taxonomicDatabase',
  'database taxa id': 'databaseTaxaId',
  'life science identifier': 'lifeScienceIdentifier',
  'taxonomic status': 'taxonomicStatus',
  'description of molecular marker': 'descriptionOfMolecularMarker',
  'voucher status': 'voucherStatus',
  'voucher code': 'voucherCode',
  'voucher institution code': 'voucherInstitutionCode',
  'tissue descriptor': 'tissueDescriptor',
  'preservation method': 'preservationMethod',

  // --- 修正了的逻辑映射 ---
  // (这些字段在 bio.sql 中是非 DNA 字段)
  'insd accession number': 'insdAccessionNumber',
  'name of identifier': 'nameOfIdentifier',
  'identifier e mail': 'identifierEmail', // norm() 会处理 'E-mail'
  'identifier email': 'identifierEmail',
  'identifier institution': 'identifierInstitution',

  // 布尔值 (带 ? 和 (Yes/No) 的列头，norm() 会自动处理)
  'taxonomist': 'isTaxonomist' // "Taxonomist? (Yes/No)" -> norm() -> "taxonomist"
};

/**
 * 必须转换为数字的 DTO 字段 (根据 bio.sql)
 * 这是解决 400 Bad Request 的核心
 */
const numberFields = new Set([
  'orgnum',
  'totalBiomassCollected',
  'nominalSizeCategory', // ! 关键修复
  'numberOfIndividuals',
  'relativeAbundance',
  'relativeDominance',
  'taxonDensity'
]);

/**
 * 健壮的生物数据处理器
 */
export function processor(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  console.log("Processing bio data, 原始数据行数:", rows.length);

  // 打印未匹配的列头 (用于调试)
  const firstRow = rows[0] || {};
  Object.keys(firstRow).forEach(originalHeader => {
    const normalizedKey = norm(originalHeader);
    if (!headerMap[normalizedKey]) {
      console.warn(`[跳过] 未匹配的表头: "${originalHeader}" (归一化后: "${normalizedKey}")`);
    }
  });

  const processed = [];

  rows.forEach((row, index) => {
    const dtoRow = {};
    let hasValidData = false;

    for (const originalHeader in row) {
      if (!row.hasOwnProperty(originalHeader)) continue;

      const normalizedKey = norm(originalHeader);
      const jsonKey = headerMap[normalizedKey]; // 使用归一化后的 key 查找 DTO 字段

      // 如果没有映射关系，跳过该列
      if (!jsonKey) {
        continue;
      }

      let value = row[originalHeader];

      // 跳过空值 (null, undefined, 空字符串, 或 "NA")
      if (value === null || value === undefined) {
        continue;
      }
      const valueStr = String(value).trim();
      if (valueStr === "" || valueStr.toUpperCase() === "NA") {
        continue;
      }

      try {
        // --- 类型转换 ---

        // 日期字段
        if (jsonKey === "identificationDate") {
          value = formatDateToISO(value); // 格式化为 YYYY-MM-DD
          if (!value) continue; // 无效日期跳过
        }
        // 布尔字段
        else if (jsonKey === "isTaxonomist") {
          value = ['yes', 'y', 'true', '1'].includes(valueStr.toLowerCase());
        }
        // 数字字段 (使用 Set 检查)
        else if (numberFields.has(jsonKey)) {
          const num = parseFloat(valueStr.replace(/[^\d.-]/g, ""));
          if (Number.isFinite(num)) {
            value = num;
          } else {
            console.warn(`第 ${index + 2} 行, 列 "${originalHeader}" 的值 "${valueStr}" 无法转为数字，已跳过。`);
            continue; // 无效数字跳过
          }
        }
        // 字符串字段 (默认)
        else {
          value = valueStr;
        }

        dtoRow[jsonKey] = value;
        hasValidData = true;

      } catch (error) {
        console.warn(`第 ${index + 2} 行，列 "${originalHeader}" 处理失败:`, error);
      }
    }

    // 只有在处理后包含有效数据 (且必须有 orgnum) 时才返回该行
    // (bio.sql 指出 orgnum 是 NOT NULL)
    if (hasValidData && (dtoRow.orgnum || dtoRow.sampleName)) {
      processed.push(dtoRow);
    } else {
      console.warn(`第 ${index + 2} 行数据因缺少关键信息(如 orgnum 或 sampleName)或无有效数据而被跳过。`);
    }
  });

  console.log("处理完毕，有效数据行数:", processed.length);
  if (processed.length > 0) {
    console.log("第一条数据示例:", processed[0]);
  }

  return processed;
}

// 新增：从一行数据中提取 sampleId（支持多种列名）
function pickSampleId(row) {
  return (
    row['Sample ID'] ??
    row['sample_id'] ??
    row.sampleId ??
    row.sample_id ??
    null
  );
}

// 新增：规范化 orgnum，允许为空
function normalizeOrgnum(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// 修改：构建生物数据对象时优先使用 sampleId，orgnum 可空
export function processBioRows(rows) {
  return rows
    .map((raw) => {
      const sampleId = pickSampleId(raw);
      const sampleName =
        raw['Sample Name'] ?? raw['sampleName'] ?? raw.sampleName ?? undefined;

      return {
        // 必填：Sample ID
        sampleId: sampleId ? Number(sampleId) : undefined,

        // 兼容旧版：若后端仍按名称匹配，可同时传 sampleName（若没有就不传）
        ...(sampleName ? { sampleName: String(sampleName).trim() } : {}),

        // OrgNum 可为空
        orgnum: normalizeOrgnum(
          raw['OrgNum'] ?? raw['orgnum'] ?? raw.orgnum ?? null
        ),

        // 其余字段保持不变（根据你现有模板字段名取值）
        taxaGenus:
          raw['taxaGenus'] ?? raw.taxaGenus ?? raw['属'] ?? undefined,
        taxaSpecies:
          raw['taxaSpecies'] ?? raw.taxaSpecies ?? raw['种'] ?? undefined,
        scientificName:
          raw['scientificName'] ??
          raw.scientificName ??
          raw['学名'] ??
          undefined,
        morphotype:
          raw['morphotype'] ?? raw.morphotype ?? raw['形态型'] ?? undefined,
      };
    })
    // 基础校验：只保留有 sampleId 的记录
    .filter((it) => Number.isFinite(it.sampleId));
}

// 修改：导出校验规则，只要求 sampleId
export const bioRequiredFields = ['sampleId'];