select 
calendar_name as service_id
,case mon when true then 1 else 0 end as monday
,case tue when true then 1 else 0 end as tuesday
,case wed when true then 1 else 0 end as wednesday
,case thu when true then 1 else 0 end as thursday
,case fri when true then 1 else 0 end as friday
,case sat when true then 1 else 0 end as saturday
,case sun when true then 1 else 0 end as sunday
,20160101 as start_date
,20180101 as end_date
from calendar C;
