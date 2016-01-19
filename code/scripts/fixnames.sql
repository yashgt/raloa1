UPDATE stop
SET name = REPLACE (name, ' Bus Stop', '')
, name = REPLACE (name, ' Bus stop', '')
, name = REPLACE (name, ' bus stop', '')
, name = REPLACE (name, ' BUS STOP', '')
WHERE name LIKE '%Bus Stop';