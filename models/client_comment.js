'use strict'
var parse = require('co-body')

exports.comments = {
 //find all comment
  findAll: function *() {
    if(this.session.authenticated) {
      //sql search
      let rows = yield GLOBAL.db.query('SELECT * FROM client_comment')

      if(rows[0].length !== 0) {
        var response = {
          num_comments : rows[0].length,
          comment_id : [],
          email : [],
          phone : [],
          created_at : [],
          comment_text : [],
          is_check: [],
        }

        rows[0].forEach(function(comt) {
          response = add_comment(comt, response)
        })
      }

      let content = {
        comments : response,
        title : '所有留言',
      }

      this.body = yield render('show_all_comments', content)
    } else {
      let content = {
           title: '登录系统',
           error_info: '没有足够权限',
        }
        this.body = yield render('/login', content)
    }
  },

  //fill comment not check
  findAllNotCheck: function *() {
     if(this.session.authenticated) {
       //sql search
       let rows = yield GLOBAL.db.query('SELECT * FROM client_comment')

       if(rows[0].length !== 0) {
         var response = {
           num_comments : 0,
           comment_id : [],
           email : [],
           phone : [],
           created_at : [],
           comment_text : [],
           is_check: [],
         }

         rows[0].forEach(function(comt) {
           if(comt.is_check == 0) {
            response.num_comments += 1
             response = add_comment(comt, response)
           }
         })
       }

       let content = {
         comments : response,
         title : '未回复留言',
       }

       this.body = yield render('show_all_comments', content)
     } else {
       let content = {
           title: '登录系统',
           error_info: '没有足够权限',
        }
        this.body = yield render('/login', content)
     }
  },

  //check comment
  checkComment: function *() {
    if(this.session.authenticated) {
      if(this.method == 'GET') {
        try {
          let rows = yield GLOBAL.db.query('UPDATE client_comment SET is_check = 1 where comment_id=?', this.params.id)
          this.redirect('/notCheckComments')
        } catch (e) {
          switch (e.code) {
                case 'ER_BAD_NULL_ERROR':
                case 'ER_DUP_ENTRY':
                case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
                case 'ER_ROW_IS_REFERENCED_2':
                case 'ER_NO_REFERENCED_ROW_2':
                    // recognised errors for Member.update - just use default MySQL messages for now
                    return this.throw (e.message, 403); // Forbidden
                default:
                    return this.throw (e.message, 500); // Internal Server Error
            }
        }
      }
    }
  },

  //add comment
  addComment: function *() {
    if(this.method == 'POST') {
      let values = yield parse(this, {limit: '1kb'})
      values.is_check = 0
      values.created_at = new Date().toDateString()
      //console.log(values)
      try {
        let result = yield GLOBAL.db.query('Insert Into client_comment Set ?', values)
        let content = {
          is_success: true,
          title : '感谢留言'
        }
        let text = '<p>有一个客户的留言 <br>'
        text += '电话:  ' + values.phone + '<br>' 
        text += '留言: ' + values.comment_text + '<br></p>'
        text += '<p>更多详细内容  <a href="http://112.74.109.3:5000/notCheckComments">chick here</a></p>' 
        sendMail('客户留言', text)
        this.body = yield render('addComment', content) 
      } catch (e) {
          let content = {
            is_success: false,
            title : '感谢留言'
          }
          this.body = yield render('addComment', content)
        }
    }
  },

};

function add_comment(comment, response) {
  response.comment_id.push(comment.comment_id)
  response.email.push(comment.email)
  response.phone.push(comment.phone)
  response.is_check.push(comment.is_check)
  response.comment_text.push(comment.comment_text)
  response.created_at.push(comment.created_at)
  return response
}

function sendMail(subject, html) {
  var mailOptions = {
    from : 'chenliangxu@ipiaoling.com',
    to: ['lchen@europely.com', 'reservation@europely.com'],
    //to:  ['lchen@europely.com'],
    subject: subject,
    html: html
  };

  GLOBAL.smtpTransport.sendMail(mailOptions, function(error,response) {
     if (error) {
        console.log(error)
     } else {
        console.log('message has sent')
     }
     GLOBAL.smtpTransport.close()
  });
}