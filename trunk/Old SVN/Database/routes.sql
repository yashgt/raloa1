delimiter //

SELECT 
R.route_id as route_id
,'KTC' as agency_id
,'KTCL' as route_short_name
,CONCAT(S1.name,'-',S2.name) as route_long_name
,3 as route_type


from route R
inner join routestop RS1 on (R.route_id=RS1.route_id)
inner join stop S1 on (RS1.stop_id = S1.stop_id)

inner join routestop RS2 on (R.route_id=RS2.route_id)
inner join stop S2 on (RS2.stop_id = S2.stop_id)
where RS1.sequence=1
and RS2.sequence = ( select max(sequence) from routestop RS where RS.route_id = R.route_id ) ;

//