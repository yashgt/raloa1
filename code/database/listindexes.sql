select
t.name as 'Table'
,i.name as 'Index'
,group_concat(f.name order by f.pos) as 'Columns'
from information_schema.innodb_sys_tables t
join information_schema.innodb_sys_indexes i using(table_id)
join information_schema.innodb_sys_fields f using(index_id)
where t.name like 'raloa2%'
group by 1,2
;
