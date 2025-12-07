-- CREATE TABLE biological_results_main (
--     id BIGSERIAL PRIMARY KEY,                      -- 主键
--     sample_id BIGINT NOT NULL,                     -- 样品id
--     station_id BIGINT NOT NULL,                    -- 站点id
--     cruise_id BIGINT NOT NULL,                     -- 航次id
--     orgnum BIGINT NOT NULL UNIQUE,                 -- 每个分类群唯一编号
   
--     -- 分类标识 Taxa ID
--     taxa_kingdom TEXT,                             -- 界
--     taxa_phylum TEXT,                              -- 门
--     taxa_class TEXT,                               -- 纲
--     taxa_order TEXT,                               -- 目
--     taxa_family TEXT,                              -- 科
--     taxa_subfamily TEXT,                           -- 亚科
--     taxa_genus TEXT,                               -- 属
--     taxa_species TEXT,                             -- 种
--     taxonomic_author_citation TEXT,                -- 分类学作者引用
--     scientific_name TEXT,                          -- 完整科学名称
--     morphotype TEXT,                               -- 形态型
--     taxonomic_identification_qualifier TEXT,       -- 分类鉴定限定符
--     notes_on_taxonomic_identification TEXT,        -- 分类鉴定备注
--     identification_method TEXT,                    -- 鉴定方法
--     identification_date TIMESTAMP,                 -- 鉴定日期
--     identification_status TEXT,                    -- 鉴定状态

--     -- 生态学信息 Ecology
--     total_biomass_collected NUMERIC,               -- 总生物量
--     total_biomass_units TEXT,                      -- 生物量单位
--     nominal_size_category NUMERIC,                 -- 个体大小类别
--     number_of_individuals NUMERIC,                 -- 个体数量
--     relative_abundance NUMERIC,                    -- 相对丰度（%）
--     relative_dominance NUMERIC,                    -- 相对优势度（%）
--     taxon_density NUMERIC,                         -- 分类群密度
--     taxon_density_units TEXT,                      -- 密度单位
--     additional_notes_about_ecology TEXT,           -- 生态学备注

--     -- 生物个体详情 Organism Details
--     life_stage TEXT,                               -- 生活史阶段
--     sex TEXT,                                      -- 性别
--     reproductive_state TEXT,                       -- 繁殖状态
--     associated_taxa TEXT,                          -- 伴生分类群
--     additional_notes_about_organism TEXT,          -- 生物个体备注

--     -- 影像信息 PhotoVideo
--     transect_id TEXT,                              -- 生物视频id 可能多个
--     photo_file_id TEXT,                            -- 生物照片id
--     video_frame_code TEXT,                         -- 视频帧代码
--     time_stamp NUMERIC,                            -- 时间戳
--     video_photo_frame_file_name TEXT,              -- 视频照片/帧文件名
--     area_of_image NUMERIC,                         -- 图像面积(m²)
--     technical_specifications TEXT,                 -- 相机设备技术规格

--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


CREATE TABLE biological_results_detail (
    id BIGSERIAL PRIMARY KEY,                         -- 主键
    biological_result_main_id BIGINT NOT NULL,        -- 生物主表id

    -- 分类学信息
    taxonomic_database TEXT,                          -- 分类数据库
    database_taxa_id TEXT,                            -- 数据库分类ID
    life_science_identifier TEXT,                     -- 生命科学标识符
    taxonomic_status TEXT,                            -- 分类状态
    insd_accession_number TEXT,                       -- INSD登录号
    description_of_molecular_marker TEXT,             -- 分子标记描述
    voucher_status TEXT,                              -- 凭证标本状态
    voucher_code TEXT,                                -- 凭证标本代码
    voucher_institution_code TEXT,                    -- 凭证标本机构代码
    tissue_descriptor TEXT,                           -- 组织描述
    preservation_method TEXT,                         -- 保存方法

    -- 鉴定人信息
    name_of_identifier TEXT,                          -- 鉴定人姓名
    identifier_email TEXT,                            -- 鉴定人邮箱
    identifier_institution TEXT,                      -- 鉴定人机构
    is_taxonomist BOOLEAN,                            -- 是否为分类学家

    -- DNA 分类学信息
    dna_phylum TEXT,                                  -- DNA鉴定-门
    dna_class TEXT,                                   -- DNA鉴定-纲
    dna_order TEXT,                                   -- DNA鉴定-目
    dna_family TEXT,                                  -- DNA鉴定-科
    dna_subfamily TEXT,                               -- DNA鉴定-亚科
    dna_genus TEXT,                                   -- DNA鉴定-属
    dna_species TEXT,                                 -- DNA鉴定-种
    genebank_sequence_number TEXT,                    -- Genebank序列号等
    dna_taxonomist TEXT,                              -- DNA分类学家
    dna_taxonomist_email TEXT,                        -- DNA分类学家邮箱
    dna_taxonomist_institution TEXT,                  -- DNA分类学家机构
    dna_genes_used TEXT,                              -- 使用的DNA基因
    notes_on_dna_or_morphological_identification TEXT,-- DNA或形态鉴定备注

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
