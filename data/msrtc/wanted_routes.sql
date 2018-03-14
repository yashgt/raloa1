create or replace view vw_wanted_routes
as
select
        R.route_id as route_id
        , case R.route_name='ABC' or R.route_name is null
                when true then convert(R.route_id using utf8)
                else R.route_name
        end as route_name
    , (select group_concat(internal_route_cd separator ',') from internal_route_map where route_id=R.route_id group by route_id ) as internal_route_cd
/*    , substring_index((select group_concat(internal_route_cd separator ',') from internal_route_map where route_id=R.route_id group by route_id ),'-',1) as internal_route_cd1*/
        , coalesce(S1.name
                , (select SG.stage_name
                from stage SG
                where SG.route_id=R.route_id
                and SG.sequence=(select min(SG1.sequence) from stage SG1 where SG1.route_id=R.route_id group by SG1.route_id)))
    as start_stop_name
        , coalesce(S2.name
                                , (select stage_name
                                from stage SG
                                where SG.route_id=R.route_id
                                and SG.sequence=(select max(SG1.sequence) from stage SG1 where SG1.route_id=R.route_id group by SG1.route_id))) as end_stop_name
,
 (case
        (S1.location_status<>0
        and S2.location_status<>0
        and exists
        (select *
                from routestop RS
                inner join stop S
                where RS.stop_id=S.stop_id and RS.route_id=R.route_id and S.location_status=0
        )
        )
        when true then 1
        else 0
        end ) * 16
| (select case count(*) when 0 then 0 else 1 end from trip where route_id=R.route_id and fleet_id=7 limit 1) * 8
| (select case count(*) when 0 then 0 else 1 end from internal_route_map where route_id=R.route_id limit 1) * 4
| (select case count(*) when 0 then 0 else 1 end from stage SG where SG.route_id=R.route_id limit 1) * 2
| (select
        case
                count(*)>0
                and (count(*)=count(case when S.location_status<>0 then 1 end))
        when true then 1
        else 0
        end
from
        routestop RS
        inner join stop S on (RS.stop_id=S.stop_id)
        where RS.route_id=R.route_id
        and S.fleet_id=7
)
    as status
        from route R
    left outer join stop S1 on (R.start_stop_id=S1.stop_id)
        left outer join stop S2 on (R.end_stop_id=S2.stop_id)
        where R.fleet_id = 7
        and R.is_deleted=0
 /*order by (select case count(*) when 0 then 0 else 1 end from trip where route_id=R.route_id and fleet_id=in_fleet_id) desc*/
        /*having (root_fleet_id=7 and status >=16) or (root_fleet_id<>7)*/
        having (7=7
/*and substring_index(internal_route_cd,'-',1)<>internal_route_cd */
and status>=16 
) or (7<>7)
        order by status desc
        , start_stop_name asc, end_stop_name asc, route_name asc
        ;

