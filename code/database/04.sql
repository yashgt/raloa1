alter table stop 
    add g_place_id varchar(255) comment 'ID of the place indexed by Google'
    ,add g_place_name varchar(255) comment 'Name of the place given by Google'
    ,modify location_status int default 2 comment 'Bitmap for 1:Geocoded, 2:Located by Google Places, 4:Located correctly, 8:Google location rectified'
    ,add code varchar(255) comment 'Internal code of the stop'
;