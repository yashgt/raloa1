nohup node app.js &
#node-debug app.js 
echo $! > node.pid
tail -f nohup.out


