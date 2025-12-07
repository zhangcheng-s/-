-- CREATE TABLE cruises (
--     id BIGSERIAL PRIMARY KEY,                              -- 主键id
--     contract_id TEXT NOT NULL,                             -- 数据收集合同ID
--     cruise_name TEXT NOT NULL,                             -- 航次或考察名称
--     research_vessel TEXT,                                  -- 考察船名称
--     leg_number TEXT NOT NULL,                              -- 航次中的航段编号
--     geographical_area TEXT,                                -- 采样地理区域
--     area_sector TEXT,                                      -- 区域分块
--     area_type TEXT,                                        -- 区域类型
--     created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     updated_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
--     --约束
--     CONSTRAINT uk_cruise UNIQUE (contract_id, cruise_name, leg_number)
-- );


-- CREATE TABLE stations (
--     id BIGSERIAL PRIMARY KEY,                                                -- 主键id
--     cruise_id BIGINT NOT NULL,                                               -- 航次id
--     station_type TEXT NOT NULL CHECK (station_type IN ('Point', 'Towed')),   -- 站点类型
    
--     -- 点采样位置信息
--     point_name TEXT UNIQUE,                                                  -- 唯一站点标识符
--     point_description TEXT,                                                  -- 站点描述
--     latitude NUMERIC(10,6),                                                  -- 纬度
--     longitude NUMERIC(10,6),                                                 -- 经度
--     point_geom GEOMETRY(Point, 4326),                                        -- 点几何
    
--     -- 拖曳采样信息
--     tow_name TEXT UNIQUE,                                                    -- 唯一拖曳标识符
--     tow_description TEXT,                                                    -- 拖曳名称和描述
--     tow_start_latitude NUMERIC(10,6),                                        -- 拖曳起点纬度
--     tow_start_longitude NUMERIC(10,6),                                       -- 拖曳起点经度
--     tow_end_latitude NUMERIC(10,6),                                          -- 拖曳终点纬度
--     tow_end_longitude NUMERIC(10,6),                                         -- 拖曳终点经度
--     tow_path_geom GEOMETRY(LineString, 4326),                                -- 线几何
--     avg_tow_speed TEXT,
    
--     -- 勘探信息
--     exploration_block_id TEXT,                                               -- 勘探区块/单元标识符
--     block_or_cell TEXT,                                                      -- 标识是区块ID还是单元ID
--     exploration_subarea TEXT,                                                -- 勘探子区域
--     gps_transducer_position TEXT,                                            -- GPS/传感器位置
    
--     -- 审计字段
--     created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     updated_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
--     -- 条件检查约束
--     CONSTRAINT chk_point_station CHECK (
--         station_type = 'Point' AND point_name IS NOT NULL OR 
--         station_type = 'Towed'
--     ),
--     CONSTRAINT chk_tow_station CHECK (
--         station_type = 'Towed' AND tow_name IS NOT NULL OR 
--         station_type = 'Point'
--     )
-- );


-- CREATE TABLE samples (
--     id BIGSERIAL PRIMARY KEY,                                               -- 主键id
--     station_id BIGINT NOT NULL,                                             -- 站点id
--     cruise_id BIGINT NOT NULL,                                              -- 航次id
    
--     -- 业务标识
--     sample_name TEXT NOT NULL UNIQUE,                                       -- 唯一样品标识符
--     station_type TEXT NOT NULL CHECK (station_type IN ('Point', 'Towed')),  -- 冗余站点采样类型
    
--     -- 点样本信息
--     sample_date TIMESTAMPTZ,                                                -- 采样日期时间（UTC）
--     upper_depth NUMERIC(10,4),                                              -- 采样上层深度
--     lower_depth NUMERIC(10,4),                                              -- 采样下层深度
--     water_depth NUMERIC(10,4),                                              -- 最大底部水深（m）
--     water_depth_units TEXT,                                                 -- 水深单位（m）
--     profile TEXT,                                                           -- 剖面类型（固定或投放）
--     total_length NUMERIC(10,4),                                             -- 岩心/钻探总长度（cm）
--     recovery_percent NUMERIC(5,2),                                          -- 岩心/钻探回收率（%）
--     weight_sampled TEXT,                                                    -- 固体样品估算重量（含单位）
--     layer_sampled INTEGER,                                                  -- 采样层位（mm）

--     -- 拖曳采样深度信息
--     tow_start_depth NUMERIC(10,4),                                          -- 采样开始日期时间（UTC）
--     tow_end_depth NUMERIC(10,4),                                            -- 采样结束日期时间（UTC）
--     tow_min_depth NUMERIC(10,4),                                            -- 拖曳起点深度（m）
--     tow_max_depth NUMERIC(10,4),                                            -- 拖曳终点深度（m）
--     tow_depth_units TEXT,                                                   -- 拖曳最小深度（m）
--     sample_start_date TIMESTAMPTZ,                                          -- 拖曳最大深度（m）
--     sample_end_date TIMESTAMPTZ,                                            -- 拖曳深度单位（m）

--     -- 通用信息
--     time_datum TEXT,                                                        -- 时间基准（UTC）
--     depth_units TEXT,                                                       -- 深度单位（cm/m）
--     vertical_datum TEXT,                                                    -- 垂直基准面
--     -- 样品特征
--     sampler TEXT,                                                           -- 采样负责机构
--     habitat_type TEXT,                                                      -- 生境类型
--     habitat_description TEXT,                                               -- 生境描述
--     matrix_type TEXT,                                                       -- 样品基质类型
--     sample_collection_method TEXT,                                          -- 样品采集处理方法
--     -- 设备信息
--     sampling_device TEXT,                                                   -- 采样设备
--     sampling_device_brand_model TEXT,                                       -- 设备品牌型号
--     sampling_device_size TEXT,                                              -- 设备尺寸
--     -- 采样量信息
--     volume_sampled NUMERIC(10,4),                                           -- 样品陆地存储位置
--     area_sampled NUMERIC(10,4),                                             -- 关联图像文件名
--     -- 存储和其他信息
--     storage_location TEXT,                                                  -- 水柱样品体积（L）
--     image_file_name TEXT,                                                   -- 沉积物样品面积（m²）
--     sediment_age TEXT,                                                      -- 沉积物年龄估算
--     rock_description TEXT,                                                  -- 岩石基质描述
--     detritus TEXT,                                                          -- 其他相关信息
--     hydrothermal_activity TEXT,                                             -- 死亡生物组合和覆盖度
--     remarks TEXT,                                                           -- 热液活动性
    
--     -- 审计字段
--     created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     updated_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

