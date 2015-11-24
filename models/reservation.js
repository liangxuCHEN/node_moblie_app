'use strict'
var parse = require('co-body')

exports.reservation = {
 //find all comment
 
  //fill comment not check
  
  //check comment

  //add comment
  VisitCave: function *() {
    if(this.method == 'POST') {
      let values = yield parse(this, {limit: '1kb'})
      let message = {}
      message.is_check = 0
      message.created_at = new Date().toDateString()
      message.phone = values.phone
      message.email = '姓名:  ' + values.clientName + '; 邮箱:  ' + values.email + '<br>' 
      message.comment_text = '参观日期:  ' + values.visitDate + '\n参观人数:  ' + values.member +'个\n参观酒庄:  ' + values.caveName
      message.comment_text += '\n儿童:  ' + values.has_child + '个\n留言: ' + values.commentText
      //console.log(values)
      try {
        let result = yield GLOBAL.db.query('Insert Into client_comment Set ?', message)
        let content = {
          is_success: true,
          title : '感谢预约'
        }
        let text = '<p>有一个客户的预约 <br>'
        text += '姓名:  ' + values.clientName + '<br>' 
        text += '电话:  ' + values.phone + '<br>' 
        text += '邮箱:  ' + values.email + '<br>' 
        text += '参观日期:  ' + values.visitDate + '<br>' 
        text += '参观酒庄:  ' + values.caveName + '<br>' 
        text += '参观人数:  ' + values.member + '<br>' 
        text += '儿童:  ' + values.has_child + '<br>' 
        text += '留言: ' + values.commentText + '<br></p>'
        sendMail('客户留言', text)
        this.body = yield render('visitCave', content) 
      } catch (e) {
          let content = {
            is_success: false,
            title : '感谢预约'
          }
          this.body = yield render('visitCave', content)
        }
    }
     if(this.method == 'GET') {
       let content = {
          title : '预约参观酒庄'
        }
        this.body = yield render('visitCaveForm', content)
     }
  },

}

function sendMail(subject, html) {
  var mailOptions = {
    from : 'chenliangxu@ipiaoling.com',
    to: ['lchen@europely.com', 'guangyao.qi@ipiaoling.com', 'reservation@europely.com'],
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