#!/bin/bash

sudo /usr/sbin/service postgresql start
/usr/bin/pm2-runtime start leasehold-core
