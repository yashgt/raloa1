set IP=35.154.217.22
set KEY=D:\Personal\ny-prod.ppk
pscp -i %KEY% "routes.csv" ec2-user@%IP%:routes.csv
pscp -i %KEY% "etmtoload.csv" ec2-user@%IP%:etmtoload.csv
