sudo yum update

sudo yum install g++ curl libssl-dev apache2-utils
sudo yum install git-core

sudo yum install wget
wget http://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm
sudo rpm -ivh epel-release-7-5.noarch.rpm

#git clone https://github.com/joyent/node.git
#sudo yum install mysql-server-core-5.5
sudo yum install mysql
sudo yum install ruby
sudo gem install bundler
sudo gem install capistrano
sudo gem install capistrano-node-deploy
sudo npm install bower -g
sudo npm install minify -g
#wget https://storage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.6.zip
sudo yum install unzip
#unzip google_appengine_1.9.6.zip
#chmod 755 google_appengine/appcfg.py
