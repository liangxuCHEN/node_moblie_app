'use strict'
var parse = require('co-body')

exports.email = {
  sendMails: function *() {
      if(this.method == 'POST') {
          let values = yield parse(this)
          //console.log(values)
          let message = {
              title : values.email_title,
              sub_title : values.sub_title,
              logo : values.logo,
           }
          message.email_ads = []
          for (var i = values.country.length - 1; i >= 0; i--) {
	    if (values[i] == "chosed") {
	          	message.email_ads.push({
	          		country : values.country[i],
	          		pic_url : values.pic_url[i],
	          		icon_url : values.icon_url[i],
	          		city : values.city[i],
	          		short_name : values.short_name[i],
	          		model : values.model[i],
	          		price : values.price[i],
	          		site: values.site[i],
	          	})
	    }
          };
          //generate the list of email
          let list = values.email_list.split(';')
          let email_list = ['lchen@europely.com']
          if(list.length >0) {
          	list.forEach(function(email) {
          		if (email.match('@')) {
          			email_list.push(email)
          		}
          	})
          }
          //console.log(email_list)
          let content = yield render('promotion_email', message)
          this.body = content
          sendMail(values.email_theme, content, email_list)
      }
      if(this.method == 'GET') {
          let content = {
             title: 'Generate Email',
          }
          this.body = yield render('generate_mail', content)
      }

  },

  addEmailAd: function *() {
     if(this.method == 'POST') {
         let values = yield parse(this, {limit: '1kb'} )
         try {
               let result = yield GLOBAL.db.query('Insert Into email_ads Set ?', values);
               //console.log('line', result.insertId, new Date); // 
               this.redirect('/showEmailAd')
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
      if(this.method == 'GET') {
          let content = {
             title: 'Add Email ad',
          }
          this.body = yield render('add_email_ad', content)
      } 
  },

  showEmailAd: function *() {
    let rows = yield  GLOBAL.db.query('select * from line_euro')
           let content = {
             email_ads : rows[0],
             title : "show email ads",
           }
           this.body = yield render('generate_mail', content)
  },

}

function sendMail(subject, html, email_list) {
  var mailOptions = {
    from : 'chenliangxu@ipiaoling.com',
    to: email_list,
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