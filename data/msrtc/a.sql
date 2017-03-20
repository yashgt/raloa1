select
/*count(*)*/

St.stop_id
,null
,Rt.route_id
,0
,RS.stop_seq


from
route Rt
inner join internal_route_map M  on (M.route_id=Rt.route_id)
inner join msrtc.listofstopsonroutes RS on (M.internal_route_cd=RS.route_no)
inner join msrtc.listofstops S on (RS.bus_stop_cd=S.bus_stop_cd)
inner join stop St on (St.code=S.bus_stop_cd)
/*order by Rt.route_id, RS.stop_seq*/
where Rt.fleet_id=7

;
