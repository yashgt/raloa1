set OPTS=--host=localhost --user=root --password=goatransport
FOR %%i in (mrg pnj prv vsg) DO (
    echo %%i
    mysql %OPTS% --database=%%i < etm_routes.sql | tr '\t' ',' > routes_%%i.csv
    mysql %OPTS% --database=%%i < etm_routes_stages.sql | tr '\t' ',' > routes_stages_%%i.csv
    
)
REM mysql %OPTS% --database=raloa2 < tara_route_paths.sql | tr '\t' ',' > tara.txt
