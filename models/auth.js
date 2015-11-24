'use strict' 
var parse = require('co-body')

exports.auth = {
  //查询所有记录
  login: function *(){
    if (this.request.method === 'GET') {
      let content =  {title: 'login'} 
      return this.body = yield render('login', content)
    }
    if (this.request.method !== 'POST') return
    
    let body = yield parse(this)
    let rows = yield GLOBAL.db.query('select * from user where name=? and passwd=?', [body.username, body.password])
    
    if(rows[0].length !== 0) { 
    //   console.log(rows[0][0])
       this.session.authenticated = true
       this.session.power = rows[0][0].power
       this.redirect('/admin')
    } else {
      this.status = 400
      let content = {
         title: '登录系统',
         error_info: '帐号或者密码不正确',
      }
      this.body = yield render('/login', content)
    }

  },

  addUser: function *(){
    if (this.session.authenticated && this.session.power == 0) {
      if (this.request.method === 'GET') {
        let content =  {
          title: '添加用户',
           info: 'no', 
        } 
        return this.body = yield render('/addUser', content)
      }
      if(this.request.method === 'POST') {
        let body = yield parse(this)
        //console.log(body)
        //check input data
        if (body.password !== body.password2) {
          let content =  {
            title: '添加用户',
             info: '密码不一至', 
          } 
          return this.body = yield render('/addUser', content)
        }

        let rows = yield GLOBAL.db.query('select * from user where name=? ', body.username)
        if(rows[0].length !== 0) {
          let content =  {
            title: '添加用户',
             info: '用户名已经存在，请换一个名字', 
          } 
          return this.body = yield render('/addUser', content)
        }

        try {
          let values = {
            power : 2,
            name : body.username,
            passwd : body.password,
          }
          let rows = yield GLOBAL.db.query('Insert Into user Set ?', values)
          this.redirect('/admin')
        } catch (e) {
               switch (e.code) {
                   case 'ER_BAD_NULL_ERROR':
                   case 'ER_DUP_ENTRY':
                   case 'ER_NO_REFERENCED_ROW_2':
                   case 'ER_NO_DEFAULT_FOR_FIELD':
                       // recognised errors for use default MySQL messages for now
                       return this.throw (e.message, 403); // Forbidden
                   default:
                       return this.throw (e.message, 500); // Internal Server Error
               }
           }
      }
    } else {
        let content = {
           title: '登录系统',
           error_info: '没有足够权限',
        }
        this.body = yield render('/login', content)
    }
  },
 }
