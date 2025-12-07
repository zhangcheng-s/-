// src/utils/import-processors/towSampleProcessor.js

import { uploadTowData } from '@/api/management.js';
import { cleanValue, formatDateToISO } from './helpers.js';

// 1. 
// 
//  名称
export const name = "拖曳采样数据";

// 2. 
// 
//  ID
export const id = "tow";

// 3. 
// 
//  API
export const apiFunction = uploadTowData;

// 4. 
// 
//  指纹 (使用原始 CSV/Excel 表头)
export const fingerprint = [
    'Tow ID', 'Tow Description', 'Tow Start Latitude', 'Tow Start Longitude', 'Tow End Latitude', 
    'Tow End Longitude', 'Avg Tow Speed', 'Sample ID', 'Sample Start Date', 'Sample End Date', 
    'Tow Start Depth', 'Tow End Depth', 'Tow Minimum Depth', 'Tow Maximum Depth', 'Tow Depth Units'
];

// 5. 
// 
//  DTO 模板
const dtoTemplate = {
  contractId: "", cruiseName: "", researchVessel: "", legNumber: "", geographicalArea: "",
  areaSector: "", areaType: "", towName: "", towDescription: "", towStartLatitude: 0,
  towStartLongitude: 0, towEndLatitude: 0, towEndLongitude: 0, avgTowSpeed: "",
  explorationBlockId: "", blockOrCell: "", explorationSubarea: "",
  gpsTransducerPosition: "", sampleName: "", towStartDepth: 0, towEndDepth: 0,
  towMinDepth: 0, towMaxDepth: 0, towDepthUnits: "", sampleStartDate: "",
  sampleEndDate: "", timeDatum: "", depthUnits: "", verticalDatum: "", sampler: "",
  habitatType: "", habitatDescription: "", matrixType: "", sampleCollectionMethod: "",
  samplingDevice: "", samplingDeviceBrandModel: "", samplingDeviceSize: "",
  volumeSampled: 0, areaSampled: 0, storageLocation: "", imageFileName: "",
  sedimentAge: "", rockDescription: "", detritus: "", hydrothermalActivity: "",
  remarks: ""
};

/**
 * 6. 
 * * 处理器
 * @param {Array<Object>} list - 
 * * PapaParse 
 * * 解析的原始数据
 * @returns {Array<Object>} - 
 * * 符合后端 DTO 要求的数组
 */
export function processor(list) {
  return list.map(row => {
    const dto = { ...dtoTemplate }; // 
    
    
    // 复制模板

    // 
    // 
    //  (核心映射)
    dto.contractId = cleanValue(row['ContractID'], 'string');
    dto.cruiseName = cleanValue(row['Cruise Name'], 'string');
    dto.researchVessel = cleanValue(row['Research Vessel'], 'string');
    dto.legNumber = cleanValue(row['Leg Number'], 'string');
    dto.geographicalArea = cleanValue(row['Geographical Area'], 'string');
    dto.areaSector = cleanValue(row['Area sector'], 'string'); // 
    
    
    // 注意: 
    
    
    // CSV 是 "Area sector"
    dto.areaType = cleanValue(row['Area Type'], 'string');
    dto.towName = cleanValue(row['Tow ID'], 'string'); // 
    
    
    // Mapped
    dto.towDescription = cleanValue(row['Tow Description'], 'string'); // 
    
    
    // Mapped
    dto.towStartLatitude = cleanValue(row['Tow Start Latitude'], 'number');
    dto.towStartLongitude = cleanValue(row['Tow Start Longitude'], 'number');
    dto.towEndLatitude = cleanValue(row['Tow End Latitude'], 'number');
    dto.towEndLongitude = cleanValue(row['Tow End Longitude'], 'number');
    dto.avgTowSpeed = cleanValue(row['Avg Tow Speed'], 'string');
    dto.explorationBlockId = cleanValue(row['Exploration Block ID/Cell ID'], 'string'); // 
    
    
    // Mapped
    dto.blockOrCell = cleanValue(row['Block or Cell'], 'string');
    dto.explorationSubarea = cleanValue(row['Exploration Subarea'], 'string');
    dto.gpsTransducerPosition = cleanValue(row['Position of GPS/Transducer'], 'string'); // 
    
    
    // Mapped
    dto.sampleName = cleanValue(row['Sample ID'], 'string'); // 
    
    
    // Mapped
    dto.towStartDepth = cleanValue(row['Tow Start Depth'], 'number');
    dto.towEndDepth = cleanValue(row['Tow End Depth'], 'number');
    dto.towMinDepth = cleanValue(row['Tow Minimum Depth'], 'number'); // 
    
    
    // Mapped
    dto.towMaxDepth = cleanValue(row['Tow Maximum Depth'], 'number'); // 
    
    
    // Mapped
    dto.towDepthUnits = cleanValue(row['Tow Depth Units'], 'string');
    dto.sampleStartDate = formatDateToISO(row['Sample Start Date']); // 
    
    
    // Mapped + Formatted
    dto.sampleEndDate = formatDateToISO(row['Sample End Date']); // 
    
    
    // Mapped + Formatted
    dto.timeDatum = cleanValue(row['Time Datum'], 'string');
    dto.depthUnits = ""; // 
    
    
    // This field doesn't seem to be in the Tow CSV, send default
    dto.verticalDatum = cleanValue(row['Vertical Datum'], 'string');
    dto.sampler = cleanValue(row['Sampler'], 'string');
    dto.habitatType = cleanValue(row['Habitat Type'], 'string');
    dto.habitatDescription = cleanValue(row['Habitat Description'], 'string');
    dto.matrixType = cleanValue(row['Matrix Type'], 'string');
    dto.sampleCollectionMethod = cleanValue(row['Sample Collection Method'], 'string');
    dto.samplingDevice = cleanValue(row['Sampling Device'], 'string');
    dto.samplingDeviceBrandModel = cleanValue(row['Sampling Device Brand and Model'], 'string');
    dto.samplingDeviceSize = cleanValue(row['Sampling Device Size'], 'string');
    dto.volumeSampled = cleanValue(row['Volume sampled'], 'number');
    dto.areaSampled = cleanValue(row['Area Sampled'], 'number');
    dto.storageLocation = cleanValue(row['Storage Location'], 'string');
    dto.imageFileName = cleanValue(row['Image File Name'], 'string');
    dto.sedimentAge = cleanValue(row['Sediment Age (years)'], 'string'); // 
    
    
    // Mapped
    dto.rockDescription = cleanValue(row['Rock Description'], 'string');
    dto.detritus = cleanValue(row['Detritus'], 'string');
    dto.hydrothermalActivity = cleanValue(row['Hydrothermal Activity'], 'string');
    dto.remarks = cleanValue(row['Remarks'], 'string');
    
    return dto;
  });
}