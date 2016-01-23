UPDATE stop
SET 
name = substr(name from 1 for instr(lower(name), ' bus stop')-1)
WHERE 
lower(name) like '% bus stop%'
;

UPDATE stop
SET 
name = substr(name from 1 for instr(lower(name), '  bus  stop')-1)
WHERE 
lower(name) like '%  bus  stop%'
;

select
stop_id
,name
/*,substr(name from 1 for instr(lower(name), ' bus stop')-1) as op1*/
/*,substr(name from 1 for instr(lower(name), '  bus  stop')-1) as op2*/
from stop
WHERE 
lower(name) REGEXP '[[:space:]]*bus[[:space:]]*stop'
/*and stop_id=1230*/
;
