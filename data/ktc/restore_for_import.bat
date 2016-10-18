set OPTS=--host=localhost --user=root --password=goatransport
FOR %%i in (mrg pnj prv vsg) DO (
    echo %%i
    mysql %OPTS% --database=%%i < %%i.sql
    REM mysql %OPTS% --database=%%i < import_microfx.sql    
)
