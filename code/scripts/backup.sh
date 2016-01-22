TS=`date +%Y%m%d%H%M%S`
BKPFILE=$HOME/dbdumps/${TS}_avishkar.sql
STG_BKPFILE=$HOME/dbdumps/${TS}_avishkar_to_raloa2.sql
echo $DBHOST
echo $BKPFILE

mysqldump --ignore-table=avishkar.sessions  --host=${DBHOST} --user=${DBUSER} --password=${DBPWD} --add-drop-database --databases avishkar > $BKPFILE

sed 's/avishkar/raloa2/' $BKPFILE > $STG_BKPFILE

mutt -s 'Backup on ${TS}' yashgt@gmail.com -a $STG_BKPFILE < /dev/null

cp $STG_BKPFILE ../database/dump.sql
git add ../database/dump.sql
#git commit -m "Dump taken on ${TS}"

