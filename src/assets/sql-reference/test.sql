-- -- 插入点采样站
-- INSERT INTO stations (
--     cruise_id, station_type, point_name, point_description, 
--     latitude, longitude
-- ) VALUES (
--     1, 'Point', 'Station_001', '测试点采样站',
--     45.123456, -123.654321
-- );

-- -- 插入拖曳采样站
-- INSERT INTO stations (
--     cruise_id, station_type, tow_name, tow_description,
--     tow_start_latitude, tow_start_longitude,
--     tow_end_latitude, tow_end_longitude,
--     avg_tow_speed
-- ) VALUES (
--     1, 'Towed', 'Tow_001', '测试拖曳采样',
--     45.100000, -123.600000,
--     45.200000, -123.500000,
--     '2.5 knots'
-- );

-- 查询验证几何字段
SELECT 
    station_type,
    point_name,
    ST_AsText(point_geom) as point_wkt,
    tow_name,
    ST_AsText(tow_path_geom) as line_wkt
FROM stations;

-- -- 更新坐标，观察几何字段自动更新
-- UPDATE stations 
-- SET latitude = 45.555555, longitude = -123.777777
-- WHERE point_name = 'Station_001';