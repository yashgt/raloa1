TS=`date +%Y%m%d%H%M%S`
mkdir -p $HOME/dbdumps
BKPFILE=$HOME/dbdumps/${TS}_avishkar.sql
STG_BKPFILE=$HOME/dbdumps/${TS}_avishkar_to_raloa2.sql
echo $DBHOST
echo $BKPFILE

mysqldump --ignore-table=avishkar.sessions  --host=${DBHOST} --user=${DBUSER} --password=${DBPWD} --add-drop-database --databases avishkar > $BKPFILE

sed 's/avishkar/raloa2/' $BKPFILE > $STG_BKPFILE

mutt -s "Auto-backup on ${TS}" yashgt@gmail.com -c chaitanyamalik1993@gmail.com -a $STG_BKPFILE  < /dev/null

BASEDIR=$(dirname $0)
cp $STG_BKPFILE ${BASEDIR}/../database/dump.sql
#git commit -m "Dump taken on ${TS}"

