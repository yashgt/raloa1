USE information_schema;
 
SELECT *
FROM referential_constraints
WHERE constraint_schema = 'raloa2' AND
      /*table_name='route'*/
	  referenced_table_name = 'routestop'