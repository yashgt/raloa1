update listofroutes R
set stop_cnt=(select count(bus_stop_cd) from listofstopsonroutes where route_no=R.route_no)
;

update listofroutes R
set geocoded_stop_cnt=(
select count(SOR.bus_stop_cd) 
from listofstopsonroutes SOR 
inner join listofstops S on (SOR.bus_stop_cd=S.bus_stop_cd and S.lat is not null)
where SOR.route_no=R.route_no
)
;