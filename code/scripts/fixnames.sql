UPDATE stop
SET 
name = substr(name from 1 for instr(lower(name), ' bus stop')-1)
WHERE 
lower(name) REGEXP '[[:space:]]*bus[[:space:]]*stop'
;

UPDATE stop
SET 
name = substr(name from 1 for instr(lower(name), '  bus  stop')-1)
WHERE 
lower(name) REGEXP '[[:space:]]*bus  stop'
;
