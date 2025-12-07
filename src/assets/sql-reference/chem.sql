-- CREATE TABLE chem_results_main (
--     id BIGSERIAL PRIMARY KEY,          -- 主键id
--     sample_id BIGINT NOT NULL,         -- 样品标识

--     ctd_depth NUMERIC,                 -- 水深(m)
--     ctd_sample_date TIMESTAMP,         -- 采样时间
--     lod NUMERIC,                       -- 检测限
--     analytical_technique TEXT,         -- 分析方法
--     instrument TEXT,                   -- 分析仪器

--     lab_matrix_id BIGINT,              -- 实验室报告基质id
--     lab_matrix_name TEXT,              -- 实验室报告基质
--     total_or_dissolved TEXT,           -- 水样分析组分
--     measurement_basis TEXT,            -- 测量基准
--     laboratory TEXT,                   -- 分析实验室
--     remarks TEXT,                      -- 其他相关信息

--     -- 冗余外键
--     station_id BIGINT NOT NULL,        -- 站点表ID（可选）
--     cruise_id BIGINT NOT NULL,         -- 航次表ID（可选）

--     created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     updated_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );


-- CREATE TABLE chem_results_water_detail (
--     id BIGSERIAL PRIMARY KEY,
--     chem_results_main_id BIGINT NOT NULL,      -- 样品标识

--     category TEXT,	                           --分析类别
--     analysis TEXT,	                           --分析项目
--     analysis_result NUMERIC,	               --分析结果
--     units TEXT,	                               --结果单位

--     created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     updated_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

--     --约束
--     CONSTRAINT uk_analysis_water UNIQUE (chem_results_main_id, analysis)
-- );


CREATE TABLE chem_results_solid_detail (
    id BIGSERIAL PRIMARY KEY,
    chem_results_main_id BIGINT NOT NULL,           -- 样品标识

    category TEXT,	                                --分析类别
    analysis TEXT,	                                --分析项目
    analysis_result NUMERIC,                        --分析结果
    units TEXT,	                                    --结果单位

	created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    --约束
    CONSTRAINT uk_analysis_solid UNIQUE (chem_results_main_id, analysis)
);
