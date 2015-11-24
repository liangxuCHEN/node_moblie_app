/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* app handlers (invoked by router to render templates)                                           */
/*                                                                                                */
/* All functions here either render or redirect, or throw.                                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict' 
var parse = require('co-body')

exports.get_index = function *() {
    let content = {title: '环欧洲旅游'}
    this.body  = yield render('mobile_index', content)
}

exports.get_book = function *() {
    let content = {title: '行程定制'}
    this.body  = yield render('book', content)
}

exports.get_help = function *() {
    let content = {title: '帮助'}
    this.body  = yield render('help', content)
}

exports.destination = function *() {
    let content = {title: '行程咨询表单'}
    if (this.header['user-agent'].match('Mobile')) {
      this.body  = yield render('m_destination', content)
    } else {
      this.body  = yield render('destination', content)
    }
  }

exports.admin_page = function *() {
    if (this.session.authenticated) {
      let content = {
        title: 'admin',
        power: this.session.power,
      }
      this.body  = yield render('admin', content)
    } else {
      let content = {
          title: '登录系统',
          error_info: 'no',
       }
       this.body = yield render('/login', content)
    }
  }

