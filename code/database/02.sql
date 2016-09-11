CREATE TABLE if not exists internal_route_map
(
    route_id int
    ,internal_route_cd varchar(255) comment 'code used by agency in internal systems'
    ,FOREIGN KEY (route_id) REFERENCES route(route_id)
)
;

alter table route 
    add column route_cd varchar(255) comment 'code to be displayed to commuters'
;

alter table stage
    add column internal_stage_cd varchar(255) comment 'code used for the stage by agency in their internal systems'
;    
    
    