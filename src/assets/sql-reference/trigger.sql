-- -- 更新 updated_time 的触发器函数
-- CREATE OR REPLACE FUNCTION update_updated_time()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_time = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- 为 cruises 表创建更新时间触发器
-- CREATE TRIGGER trg_cruises_updated_time
--     BEFORE UPDATE ON cruises
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();
-- -- 为 stations 表创建更新时间触发器
-- CREATE TRIGGER trg_stations_updated_time
--     BEFORE UPDATE ON stations
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();
-- -- 为 samples 表创建更新时间触发器
-- CREATE TRIGGER trg_samples_updated_time
--     BEFORE UPDATE ON samples
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();
-- -- 为 chem_results_main 表创建更新时间触发器
-- CREATE TRIGGER trg_chem_results_main_updated_time
--     BEFORE UPDATE ON chem_results_main
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();
-- -- 为 chem_results_water_detail 表创建更新时间触发器
-- CREATE TRIGGER trg_chem_results_water_detail_updated_time
--     BEFORE UPDATE ON chem_results_water_detail
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();
-- -- 为 chem_results_solid_detail 表创建更新时间触发器
-- CREATE TRIGGER trg_chem_results_solid_detail_updated_time
--     BEFORE UPDATE ON chem_results_solid_detail
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();
-- -- 为 biological_results_main 表创建更新时间触发器
-- CREATE TRIGGER trg_biological_results_main_updated_time
--     BEFORE UPDATE ON biological_results_main
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();
-- -- 为 biological_results_detail 表创建更新时间触发器
-- CREATE TRIGGER trg_biological_results_detail_updated_time
--     BEFORE UPDATE ON biological_results_detail
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_time();




-- 主触发器函数：处理所有几何字段更新
CREATE OR REPLACE FUNCTION update_station_geometries()
RETURNS TRIGGER AS $$
BEGIN
    -- 如果是点采样站，更新点几何
    IF NEW.station_type = 'Point' THEN
        IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
            NEW.point_geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
        ELSE
            NEW.point_geom = NULL;
        END IF;
        
        -- 清空拖曳相关的几何字段
        NEW.tow_path_geom = NULL;
    END IF;
    
    -- 如果是拖曳采样站，更新线几何
    IF NEW.station_type = 'Towed' THEN
        IF NEW.tow_start_latitude IS NOT NULL AND NEW.tow_start_longitude IS NOT NULL AND
           NEW.tow_end_latitude IS NOT NULL AND NEW.tow_end_longitude IS NOT NULL THEN
            NEW.tow_path_geom = ST_SetSRID(
                ST_MakeLine(
                    ST_MakePoint(NEW.tow_start_longitude, NEW.tow_start_latitude),
                    ST_MakePoint(NEW.tow_end_longitude, NEW.tow_end_latitude)
                ), 4326
            );
        ELSE
            NEW.tow_path_geom = NULL;
        END IF;
        
        -- 清空点采样相关的几何字段
        NEW.point_geom = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 创建触发器，在插入或更新时自动更新几何字段
CREATE TRIGGER trg_update_station_geometries
    BEFORE INSERT OR UPDATE ON stations
    FOR EACH ROW
    EXECUTE FUNCTION update_station_geometries();