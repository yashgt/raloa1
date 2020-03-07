echo on
set OPTS=--force --host=localhost --user=root --password=Spider123
FOR %%i in (mrg pnj prv vsg) DO (
    echo %%i
	mysql %OPTS% --execute="drop database %%i"
	mysql %OPTS% --execute="create database %%i"
	mysql %OPTS% --database=%%i < all_depots\%%i\%%i.Sql"
	REM mysql %OPTS% --database=%%i < %%i.Sql"
    REM mysql %OPTS% --database=%%i < cleanup.sql
    REM mysqldump %OPTS% --add-drop-database --databases %%i > %%i.sql
)

REM mysql --host=localhost --user=root --password=goatransport --execute="drop database mrg"
REM mysql --host=localhost --user=root --password=goatransport --execute="create database mrg"
REM mysql --host=localhost --user=root --password=goatransport --database=mrg < "all_depots\Margao Backup\MicroFx_KRTC_Backup_250217.Sql"
REM mysql --host=localhost --user=root --password=goatransport --database=mrg < cleanup.sql

REM mysql --host=localhost --user=root --password=goatransport --execute="drop database pnj"
REM mysql --host=localhost --user=root --password=goatransport --execute="create database pnj"
REM mysql --host=localhost --user=root --password=goatransport --database=pnj < "all_depots\Panaji Backup\MicroFx_KRTC_Backup_100317.Sql"
REM mysql --host=localhost --user=root --password=goatransport --database=pnj < cleanup.sql

REM mysql --host=localhost --user=root --password=goatransport --execute="drop database prv"
REM mysql --host=localhost --user=root --password=goatransport --execute="create database prv"
REM mysql --host=localhost --user=root --password=goatransport --database=prv < "all_depots\Porvorim Backup\microfx_porvorim.sql"
REM mysql --host=localhost --user=root --password=goatransport --database=prv < cleanup.sql

REM mysql --host=localhost --user=root --password=goatransport --execute="drop database vsg"
REM mysql --host=localhost --user=root --password=goatransport --execute="create database vsg"
REM mysql --host=localhost --user=root --password=goatransport --database=vsg < "all_depots\Vasco Backup\MicroFx_KRTC_Backup_180717.Sql"
REM mysql --host=localhost --user=root --password=goatransport --database=vsg < cleanup.sql
