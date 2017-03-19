select
trip_id
, coalesce(arrival_time,departure_time) as arrival_time
, coalesce(departure_time, arrival_time) as departure_time
, stop_id
, stop_sequence
, pickup_type
, drop_off_type
from
(
SELECT 
Tr.trip_no as trip_id
, case Tr.arrival_tm = '00:00:00' or Tr.arrival_tm is null
	when true then case sor.stop_seq = Ts.max_stop_seq /*if last stop, the arrival tm should be present */
					when true then
						(
						select timestampadd(minute, Sg.distance*60/40000, Ptr.arrival_tm)
						from msrtc1.listoftrips Ptr
						inner join msrtc1.listofstopsonroutes Psor on (Ptr.route_no=Psor.route_no and Ptr.bus_stop_cd=Psor.bus_stop_cd)
						inner join stop S1 on (Psor.bus_stop_cd=S1.code and S1.fleet_id=7)
						inner join segment Sg on (Sg.from_stop_id=S1.stop_id )
						where Psor.stop_seq<sor.stop_seq and Ptr.trip_no=Tr.trip_no
						and Sg.to_stop_id=S.stop_id
						order by Psor.stop_seq
						limit 1
						)
					else
						null
					end
	else
		case Tr.arrival_tm < (select first_stop_departure_tm 
						from msrtc1.tripsummary T 
						where T.trip_no=Tr.trip_no 
						) 
		when true then addtime(Tr.arrival_tm, '24:00:00')  
		else Tr.arrival_tm
		end 
	end as arrival_time
, case Tr.departure_tm < (select first_stop_departure_tm 
						from msrtc1.tripsummary T 
						where T.trip_no=Tr.trip_no 
						) 
	when true then addtime(Tr.departure_tm, '24:00:00')  
	else Tr.departure_tm
  end as departure_time
,sor.bus_stop_cd as stop_id 
,sor.stop_seq as stop_sequence
,abs(Tr.is_boarding_stop-1) as pickup_type
,abs(Tr.is_alighting-1) as drop_off_type
FROM route R
inner join internal_route_map M on (R.route_id=M.route_id)
inner join msrtc1.listofstopsonroutes sor on (M.internal_route_cd=sor.route_no)
inner join stop S on (S.code=sor.bus_stop_cd and S.fleet_id=7)
inner join msrtc1.listoftrips Tr on (sor.route_no=Tr.ROUTE_NO and sor.bus_stop_cd=Tr.bus_stop_cd)
inner join msrtc1.tripsummary Ts on (Ts.trip_no=Tr.trip_no)
where R.fleet_id=7
order by M.internal_route_cd, Tr.trip_no, sor.stop_seq
)
;