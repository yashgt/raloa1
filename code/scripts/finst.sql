select
stop_id
,name
,quote(substr(name from 1 for instr(lower(name), ' bus stop')-1)) as op1
/*,substr(name from 1 for instr(lower(name), '  bus  stop')-1) as op2*/
from stop
WHERE 
lower(name) like '% bus stop%'
/*and stop_id=1230*/
;

select
stop_id
,name
/*,substr(name from 1 for instr(lower(name), ' bus stop')-1) as op1*/
,quote(substr(name from 1 for instr(lower(name), '  bus  stop')-1)) as op2
from stop
WHERE 
lower(name) like '%  bus  stop%'
/*and stop_id=1230*/
;


