<?php
$branch_name = "master";
$remote = "origin";

exec("sudo -u www-data git reset --hard");
exec("sudo -u www-data git pull {$remote} {$branch_name} > auto_deploy_error.log 2>&1");
exec("npm run server:build");
exec("pm2 delete 0");
exec("pm2 start dist/server/server.js");
