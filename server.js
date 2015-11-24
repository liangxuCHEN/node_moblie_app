'use strict' 

var koa = require('koa')
var views = require('co-views')
var parse = require('co-body')
var session = require('koa-session')
var serve = require('koa-static-cache')

global.app = koa()

//数据库配置
var co = require('co')
var mysql = require('mysql-co');

//----------sesion--------------
app.keys = ['chenliangxu']
app.use(session(app))

//批量装载theme目录下的文件
app.use(serve('./themes',{maxAge: 365 * 24 * 60 * 60}))

//====================db===============
// MySQL connection pool TODO: how to catch connection exception eg invalid password?
let config = require('./config/db-development.json')
GLOBAL.connectionPool = mysql.createPool(config.db); // put in GLOBAL to pass to sub-apps
// set up MySQL connection
app.use(function* mysqlConnection(next) {
    // keep copy of this.db in GLOBAL for access from models
    this.db = GLOBAL.db = yield GLOBAL.connectionPool.getConnection()
    yield next
    this.db.release()
})

//========================email=======================
var nodemailer = require('nodemailer')
GLOBAL.smtpTransport = nodemailer.createTransport({
  service: 'QQex',
  auth: {
    user: 'chenliangxu@ipiaoling.com',
    pass: 'xxx',
  }
})

//=============全局异常处理=============
require('./errhandle.js')

global.render = views('./views', {
  ext: 'ejs'
})
//批量装载routes目录下的所有路由文件
require("fs").readdirSync("./routes").forEach(function(file) {
    require("./routes/" + file);
});


//========app setting===============
app
  .use(function *notFound(next) {
    if (this.status == 404) {
      let content = {title : '页面不存在'}
      this.body = yield render('no_found', content)
    } else {
      yield next
    }
  })

app.listen(3000)
console.log('listening on port 3000');
