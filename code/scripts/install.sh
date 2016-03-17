sudo yum update

#sudo yum install g++ curl libssl-dev apache1-utils
#sudo yum install git-core
sudo yum install git-all
sudo yum install wget
wget https://nodejs.org/dist/v4.3.2/node-v4.3.2-linux-x64.tar.xz
sudo yum -y install xz
unxz node-v4.3.2-linux-x64.tar.xz
tar xvf node-v4.3.2-linux-x64.tar

sudo yum install -y gcc
sudo yum install -y zip

wget https://bootstrap.pypa.io/ez_setup.py -O - | sudo python
sudo easy_install --upgrade pytz

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
