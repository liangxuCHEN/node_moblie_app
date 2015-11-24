## install node step
```js
$ yum -y install gcc gcc-c++
$ yum -y update && yum -y groupinstall "Development Tools" 
$ wget http://nodejs.org/dist/v0.12.2/node-v0.12.2.tar.gz 
$ tar -xf node-v0.12.2.tar.gz node-v0.12.2/ 
$ ./configuer 
$ make 
$ sudo make install 
$ node -v
$ npm install koa co-views co-body ejs koa-router co mysql-co koa-session underscore
```

## service nginx
add the text into the file /etc/nginx/sites-available/default

```js
$ You may add here your
server {
    listen  8000;
    server_name app.com;
    location / {
    proxy_pass http://127.0.0.1:8000;
    }
}
```
And then restart nginx
```js
$ nginx restart
```