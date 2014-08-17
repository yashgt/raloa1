REM npm -g install js-beautify

cd %~dp0

call html-beautify -r administration\admin_app\public\admin.html

call js-beautify -r administration\admin_app\public\js\goatransadmin.js
call js-beautify -r administration\admin_app\public\js\RouteController.js
call js-beautify -r administration\admin_app\app.js

