#!/bin/sh

sudo apt update -y && sudo apt-get upgrade -y
sudo apt install mysql-server
sudo service mysql status
sudo service mysql start
sudo service mysql status



# ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'myrootpass123';
# FLUSH PRIVILEGES;