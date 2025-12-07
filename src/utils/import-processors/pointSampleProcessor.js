// src/utils/import-processors/pointSampleProcessor.js

import { uploadPointData } from '@/api/management.js';
import { cleanValue, formatDateToISO } from './helpers.js';

// 1. 用户友好的名称
export const name = "点采样数据";

// 2. 唯一的 ID
export const id = "point";

// 3. 要调用的 API 函数
export const apiFunction = uploadPointData;

// 4. 用于检测的“指纹” (使用原始 CSV/Excel 表头)
export const fingerprint = [
    'Station ID', 'Station Description', 'Latitude', 'Longitude', 'Sample ID', 
    'Sample Date', 'Upper Depth', 'Lower Depth', 'Water Depth', 'Water Depth Units', 
    'Sampler', 'Profile', 'Total Length (cm)', 'Recovery (%)', 'Weight Sampled'
];

// 5. 后端的 DTO 模板 (所有字段和默认值)
const dtoTemplate = {
  contractId: "", cruiseName: "", researchVessel: "", legNumber: "", geographicalArea: "",
  areaSector: "", areaType: "", pointName: "", pointDescription: "", latitude: 0,
  longitude: 0, explorationBlockId: "", blockOrCell: "", explorationSubarea: "",
  gpsTransducerPosition: "", sampleName: "", sampleDate: "", upperDepth: 0,
  lowerDepth: 0, waterDepth: 0, waterDepthUnits: "", profile: "", totalLength: 0,
  recoveryPercent: 0, weightSampled: "", layerSampled: 0, timeDatum: "", depthUnits: "",
  verticalDatum: "", sampler: "", habitatType: "", habitatDescription: "", matrixType: "",
  sampleCollectionMethod: "", samplingDevice: "", samplingDeviceBrandModel: "",
  samplingDeviceSize: "", volumeSampled: 0, areaSampled: 0, storageLocation: "",
  imageFileName: "", sedimentAge: "", rockDescription: "", detritus: "",
  hydrothermalActivity: "", remarks: ""
};

/**
 * 6. 将解析后的数据列表 (list) 转换为后端 DTO 数组
 * @param {Array<Object>} list - PapaParse 解析的原始数据
 * @returns {Array<Object>} - 符合后端 DTO 要求的数组
 */
export function processor(list) {
  return list.map(row => {
    // row 是CSV的原始对象, e.g., { "ContractID": "...", "Station ID": "..." }
    const dto = { ...dtoTemplate }; // 复制模板

    // (核心映射) 将 CSV/Excel 表头 映射到 DTO 字段
    dto.contractId = cleanValue(row['ContractID'], 'string');
    dto.cruiseName = cleanValue(row['Cruise Name'], 'string');
    dto.researchVessel = cleanValue(row['Research Vessel'], 'string');
    dto.legNumber = cleanValue(row['Leg Number'], 'string');
    dto.geographicalArea = cleanValue(row['Geographical Area'], 'string');
    dto.areaSector = cleanValue(row['Area Sector'], 'string');
    dto.areaType = cleanValue(row['Area Type'], 'string');
    dto.pointName = cleanValue(row['Station ID'], 'string'); // Mapped
    dto.pointDescription = cleanValue(row['Station Description'], 'string'); // Mapped
    dto.latitude = cleanValue(row['Latitude'], 'number');
    dto.longitude = cleanValue(row['Longitude'], 'number');
    dto.explorationBlockId = cleanValue(row['Exploration Block ID/Cell ID'], 'string'); // Mapped
    dto.blockOrCell = cleanValue(row['Block or Cell'], 'string');
    dto.explorationSubarea = cleanValue(row['Exploration Subarea'], 'string');
    dto.gpsTransducerPosition = cleanValue(row['Position of GPS/Transducer'], 'string'); // Mapped
    dto.sampleName = cleanValue(row['Sample ID'], 'string'); // Mapped
    dto.sampleDate = formatDateToISO(row['Sample Date']); // Mapped + Formatted
    dto.upperDepth = cleanValue(row['Upper Depth'], 'number');
    dto.lowerDepth = cleanValue(row['Lower Depth'], 'number');
    dto.waterDepth = cleanValue(row['Water Depth'], 'number');
    dto.waterDepthUnits = cleanValue(row['Water Depth Units'], 'string');
    dto.profile = cleanValue(row['Profile'], 'string');
    dto.totalLength = cleanValue(row['Total Length (cm)'], 'number'); // Mapped
    dto.recoveryPercent = cleanValue(row['Recovery (%)'], 'number'); // Mapped
    dto.weightSampled = cleanValue(row['Weight Sampled'], 'string');
    dto.layerSampled = cleanValue(row['Layer Sampled'], 'number');
    dto.timeDatum = cleanValue(row['Time Datum'], 'string');
    dto.depthUnits = cleanValue(row['Depth Units'], 'string');
    dto.verticalDatum = cleanValue(row['Vertical Datum'], 'string');
    dto.sampler = cleanValue(row['Sampler'], 'string');
    dto.habitatType = cleanValue(row['Habitat Type'], 'string');
    dto.habitatDescription = cleanValue(row['Habitat Description'], 'string');
    
    // ======================================================
    // 
    // 
    //  修改点 1 (FIXED):
    // 
    // 
    //  CSV 
    // 
    // 
    //  表头是 'MatrixType' (
    // 
    // 
    //  无空格
    // 
    // 
    //  ), 
    // 
    // 
    //  代码中之前是 'Matrix Type' (
    // 
    // 
    //  有空格
    // 
    // 
    //  )
    // 
    // 
    // 
    dto.matrixType = cleanValue(row['Matrix Type'], 'string');
    // ======================================================

    dto.sampleCollectionMethod = cleanValue(row['Sample Collection Method'], 'string');
    dto.samplingDevice = cleanValue(row['Sampling Device'], 'string');
    dto.samplingDeviceBrandModel = cleanValue(row['Sampling Device Brand and Model'], 'string');

    // ======================================================
    // 
    // 
    //  修改点 2 (FIXED):
    // 
    // 
    //  之前的变量是 'row_' (
    // 
    // 
    //  带下划线
    // 
    // 
    //  ), 
    // 
    // 
    //  导致了 'ReferenceError'
    // 
    // 
    // 
    dto.samplingDeviceSize = cleanValue(row['Sampling Device Size'], 'string');
    // ======================================================
    
    // 从 "12L" 这样的字符串中提取数字
    const rawVolume = row['Volume sampled'];
    const numericVolume = rawVolume ? parseFloat(rawVolume) : 0;
    dto.volumeSampled = isNaN(numericVolume) ? 0 : numericVolume;

    dto.areaSampled = cleanValue(row['Area Sampled'], 'number');
    dto.storageLocation = cleanValue(row['Storage Location'], 'string');
    dto.imageFileName = cleanValue(row['Image File Name'], 'string');
    dto.sedimentAge = cleanValue(row['Sediment Age (years)'], 'string'); // Mapped
    dto.rockDescription = cleanValue(row['Rock Description'], 'string');
    dto.detritus = cleanValue(row['Detritus'], 'string');
    dto.hydrothermalActivity = cleanValue(row['Hydrothermal Activity'], 'string');
    dto.remarks = cleanValue(row['Remarks'], 'string');
    
    return dto;
  });
}