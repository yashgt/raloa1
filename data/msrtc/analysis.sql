/* route with stop multiple times */
select *
from msrtc.listofstopsonroutes RS
inner join
(
select ROUTE_NO, BUS_STOP_CD, count(*) 
from msrtc.listofstopsonroutes
group by route_no, BUS_STOP_CD
having count(*)>1
order by count(*) desc
) RS1
on (RS.ROUTE_NO=RS1.route_no)
order by RS.route_no
;

/* no trips */
select R.* from msrtc.listofroutes R 
left outer join msrtc.listoftrips T on R.route_no=T.ROUTE_NO
where T.ROUTE_NO is null
;
