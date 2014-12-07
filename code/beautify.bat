REM npm -g install js-beautify

cd %~dp0

call html-beautify -r admin\public\index.ejs

call js-beautify -r admin\public\javascripts\RouteController.js
call js-beautify -r admin\app.js

