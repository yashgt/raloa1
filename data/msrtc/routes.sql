use msrtc1;

select 
/*LOR.route_no, LOR.route_name, LOR.from_stop_cd, LOR.till_stop_cd*/
count(*)
from msrtc1.listofroutes LOR
inner join routesummary R1 on (LOR.route_no=R1.route_no)
left outer join routesummary R2 on
(
R2.from_stop_cd=R1.till_stop_cd
and R2.till_stop_cd=R1.from_stop_cd
and ((R2.via_stop_cd=R1.via_stop_cd) or (R2.via_stop_cd is null and R1.via_stop_cd is null))
)
where R1.from_stop_cd<=R1.till_stop_cd
and exists (select 1 from msrtc1.listofstopsonroutes SOR where SOR.route_no=LOR.route_no)
;
