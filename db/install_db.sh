#!/bin/sh

sudo apt update -y && sudo apt-get upgrade -y
sudo apt install mysql-server
sudo service mysql status
sudo service mysql start
sudo service mysql status
