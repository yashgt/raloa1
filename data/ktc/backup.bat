set OPTS=--force --host=localhost --user=root --password=goatransport
FOR %%i in (mrg pnj prv vsg) DO (
    echo %%i
    mysql %OPTS% --database=%%i < cleanup.sql
    mysqldump --host=localhost --user=root --password=goatransport --add-drop-database --databases %%i > %%i.sql
)

REM mysql %OPTS% --database=mrg < cleanup.sql
REM mysqldump --ignore-table=avishkar.sessions  --host=localhost --user=root --password=goatransport --add-drop-database --databases mrg > mrg.sql

REM mysql %OPTS% --database=pnj < cleanup.sql
REM mysqldump --ignore-table=avishkar.sessions  --host=localhost --user=root --password=goatransport --add-drop-database --databases pnj > pnj.sql

REM mysql %OPTS% --database=prv < cleanup.sql
REM mysqldump --ignore-table=avishkar.sessions  --host=localhost --user=root --password=goatransport --add-drop-database --databases prv > prv.sql

REM mysql %OPTS% --database=vsg < cleanup.sql
REM mysqldump --ignore-table=avishkar.sessions  --host=localhost --user=root --password=goatransport --add-drop-database --databases vsg > vsg.sql