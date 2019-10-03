[![standard-readme compliant](https://img.shields.io/badge/Project-NZB%20|%20CLoud%20Backend-blue.svg?style=flat-square)]()

## Initial install
 
1. `sudo apt-get install nodejs`
2. `sudo ln -s /usr/bin/nodejs /usr/bin/node`
3. `npm install -g pm2`

## Install

```bash
$ git clone git@bitbucket.org:jantonk/nzbcloud-spa-backend.git
$ cd nzbcloud-spa-backend
$ npm install
```
### Run project

For Development:

After that go to project folder and run project with the following command:
```bash
$ npm start
```
OR

For Production:

Before run project we need change some configs:
```bash

$ nano nzbcloud-spa-backend/server/src/configs.ts (set true for production config)
```
After that go to project folder and run project with the following command:
```bash
$ npm run server:build
$ pm2 start dist/server/server.js
```

