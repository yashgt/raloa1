sudo yum update

#sudo yum install g++ curl libssl-dev apache1-utils
#sudo yum install git-core
sudo yum install -y git-all wget gcc zip xz mysql ruby bundler capistrano capistrano-node-deploy unzip perl-devel perl-CPAN java-1.8.0-openjdk.x86_64 at graphviz python3

wget https://nodejs.org/dist/v4.5.0/node-v4.5.0-linux-x64.tar.xz
unxz node-v4.5.0-linux-x64.tar.xz
tar xvf node-v4.5.0-linux-x64.tar


wget https://bootstrap.pypa.io/ez_setup.py -O - | sudo python
sudo easy_install --upgrade pytz
sudo easy_install csvkit

wget http://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm
sudo rpm -ivh epel-release-7-5.noarch.rpm

#git clone https://github.com/joyent/node.git
#sudo yum install mysql-server-core-5.5
sudo npm install bower -g
sudo npm install minify -g
#wget https://storage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.6.zip
#unzip google_appengine_1.9.6.zip
#chmod 755 google_appengine/appcfg.py

cpan App::cpanminus

wget http://search.cpan.org/CPAN/authors/id/K/KE/KEN/xls2csv-1.06.tar.gz && gunzip xls2csv-1.06.tar.gz && tar xvf xls2csv-1.06.tar
cd xls2csv-1.06 && perl Makefile.PL && make && sudo make install

cpanm Locale::Recode Unicode::Map Spreadsheet::ParseExcel Text::CSV_XS
sudo easy_install xlsx2csv

wget https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 sudo ln -s $HOME/jq-linux64 /usr/bin/jq

cd $HOME
git clone https://github.com/google/transitfeed.git
