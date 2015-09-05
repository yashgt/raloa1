export NODE_PATH=node_modules:../common:.
echo $NODE_PATH
echo $PWD
nohup node app.js &
echo $! > node.pid


