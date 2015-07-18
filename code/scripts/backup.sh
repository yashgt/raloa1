TS=`date +%Y%m%d%H%M%S`
echo $DBHOST
mysqldump --host=${DBHOST} --user=${DBUSER} --password=${DBPWD} avishkar > $HOME/dbdumps/$TS.sql
mutt -s 'Backup on ${TS}' yashgt@gmail.com -a $HOME/dbdumps/$TS.sql < /dev/null
