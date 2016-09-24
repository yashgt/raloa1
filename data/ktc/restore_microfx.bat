mysql --host=localhost --user=root --password=goatransport --execute="create database mrg"
mysql --host=localhost --user=root --password=goatransport --database=mrg < all_depots\Margao-depot\MicroFx_KRTC_Backup_170916.Sql

mysql --host=localhost --user=root --password=goatransport --execute="create database pnj"
mysql --host=localhost --user=root --password=goatransport --database=pnj < all_depots\Panaji-depot\MicroFx_KRTC_Backup_110816.Sql

mysql --host=localhost --user=root --password=goatransport --execute="create database prv"
mysql --host=localhost --user=root --password=goatransport --database=prv < all_depots\Porvorim-depot\MicroFx_KRTC_Backup_090816.Sql

mysql --host=localhost --user=root --password=goatransport --execute="create database vsg"
mysql --host=localhost --user=root --password=goatransport --database=vsg < all_depots\Vasco-depot\MicroFx_KRTC_Backup_100916.Sql