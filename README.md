# 生物样本详情页面 (Biological Sample Detail View)

这个项目包含一个完整的 Vue.js 组件，用于展示生物样本的详细信息。

## 文件说明

- `detail.vue` - 主要的 Vue 单文件组件
- `IMPLEMENTATION.md` - 详细的实现文档

## 功能特性

✅ 展示所有后端字段（68个字段）
✅ 条件渲染（只显示有值的字段）
✅ 平衡的响应式网格布局
✅ 修复的悬停状态（内容不会消失）
✅ 图标映射（不同字段使用不同图标）
✅ 彩色渐变样式
✅ 移动端适配

## 主要组件

### 1. Hero Header
- 紫色渐变背景
- 物种学名和作者引用
- 状态标签
- 物种照片

### 2. 统计卡片行
- 4个关键指标
- 个体数量、总生物量、相对丰度、分类群密度

### 3. 信息卡片
- 样本信息
- 站点信息
- 航次信息
- 生态数据分析（进度条）
- 详细生态学信息（彩色图标网格）
- 分类学层级
- DNA鉴定信息
- 鉴定人信息
- 凭证信息
- 分子数据
- 数据库信息
- 媒体信息
- 时间戳

## 技术栈

- Vue.js 2.x
- Element UI 2.x
- CSS Grid Layout

## 使用方法

1. 将 `detail.vue` 导入到你的 Vue 项目中
2. 注册组件
3. 通过 API 加载数据并传递给组件

详细使用方法请参考 `IMPLEMENTATION.md`

## 数据结构

组件期望接收包含以下字段的数据对象：

```javascript
{
  id, sampleId, sampleName, stationId, cruiseId, orgnum,
  taxaKingdom, taxaPhylum, taxaClass, taxaOrder, taxaFamily,
  taxaSubfamily, taxaGenus, taxaSpecies, taxonomicAuthorCitation,
  scientificName, morphotype, taxonomicIdentificationQualifier,
  notesOnTaxonomicIdentification, identificationMethod,
  identificationDate, identificationStatus, totalBiomassCollected,
  totalBiomassUnits, nominalSizeCategory, numberOfIndividuals,
  relativeAbundance, relativeDominance, taxonDensity,
  taxonDensityUnits, additionalNotesAboutEcology, lifeStage,
  sex, reproductiveState, associatedTaxa,
  additionalNotesAboutOrganism, transectId, photoFileName,
  videoFrameCode, videoPhotoFrameFileName, createdTime,
  updatedTime, taxonomicDatabase, databaseTaxaId,
  lifeScienceIdentifier, taxonomicStatus, insdAccessionNumber,
  descriptionOfMolecularMarker, voucherStatus, voucherCode,
  voucherInstitutionCode, tissueDescriptor, preservationMethod,
  nameOfIdentifier, identifierEmail, identifierInstitution,
  isTaxonomist, dnaPhylum, dnaClass, dnaOrder, dnaFamily,
  dnaSubfamily, dnaGenus, dnaSpecies, genebankSequenceNumber,
  dnaTaxonomist, dnaTaxonomistEmail, dnaTaxonomistInstitution,
  dnaGenesUsed, notesOnDnaOrMorphologicalIdentification
}
```

## 问题解决

### ✅ 布局不平衡
使用 CSS Grid 的 `auto-fit` 和 `minmax` 实现自动平衡的多列布局

### ✅ 悬停状态异常
只使用 `transform` 和 `box-shadow` 添加视觉效果，内容始终保持可见

### ✅ 字段展示不完整
实现了所有68个字段的展示，并使用条件渲染

### ✅ 样式优化
实现了彩色渐变图标、进度条、分类层级展示等设计要求

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT