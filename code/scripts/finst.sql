select
name
,substr(name from 1 for instr(lower(name), ' bus stop')-1)
,substr(name from 1 for instr(lower(name), '  bus  stop')-1)
from stop
WHERE 
lower(name) REGEXP '[[:space:]]*bus[[:space:]]*stop'
and stop_id=1230
;
