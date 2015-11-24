'use strict' 
var parse = require('co-body')
var url = require('url')
var _ = require('underscore')

exports.client_source = {

  addSource: function *() {
    if (this.session.authenticated ) {
       let params = url.parse(this.url, true).query
       //console.log(params)
       let values = {
          'web' : params.web,
          'source_name' : params.source_name,
          'created_at' : new Date().toISOString()
       }
       //console.log(values)
       try {
          let rows = yield GLOBAL.db.query('Insert Into source Set ?', values)
          this.body = 'OK'
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
    } else {
        let content = {
           title: '登录系统',
           error_info: '没有足够权限',
        }
        this.body = yield render('/login', content)
    }
  },

//deleted the source
  delSource: function *() {
    if (this.session.authenticated ) {
       let params = url.parse(this.url, true).query
       //console.log(params)
       try {
          //delete from source where web="ipiaoling" and source_name="qyer" order by created_at desc limit 1;
          let rows = yield GLOBAL.db.query(
            'DELETE FROM source WHERE web= ? and source_name=? ORDER BY created_at DESC LIMIT 1', [params.web, params.source_name])
          this.body = 'OK'
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
    } else {
        let content = {
           title: '登录系统',
           error_info: '没有足够权限',
        }
        this.body = yield render('/login', content)
    }
  },

  showSources: function *() {
    if (this.session.authenticated ) {
        //watch params
        let params = url.parse(this.url, true).query
      //   console.log(params)
         let rows = yield GLOBAL.db.query('Select * from source')
         if(rows[0].length !== 0) {
            var europely = {
                 source_name : [],
                 created_at: [],
              }
            var ipiaoling = {
                 source_name : [],
                 created_at: [],
            }
            _.each(rows[0], function(source) {
              if (source.web == 'europely') {
                europely = add_source(source, europely)
              } else {
                ipiaoling = add_source(source, ipiaoling)
              }
            })
          }

          //edit the response of europely
          let res = stats_source(europely, params)
          europely['web'] = _.keys(res)
          europely['num_source'] = europely['web'].length
          europely['count'] =  _.values(res)
          //calunate the total count
          europely['total'] = _.reduce(europely['count'], function(memo, num) { return memo + num }, 0)
          europely['created_at'] = NaN

          //edit the response of ipiaoling
          res = stats_source(ipiaoling, params)
          ipiaoling['web'] = _.keys(res)
          ipiaoling['num_source'] = ipiaoling['web'].length
          ipiaoling['count'] =  _.values(res)
          //calunate the total count
          ipiaoling['total'] = _.reduce(ipiaoling['count'], function(memo, num){ return memo + num }, 0)
          ipiaoling['created_at'] = NaN
          //console.log(response)
          
          if (_.isEmpty(params)) {
            let content = {
              title : "Source",
              ipiaoling_source : ipiaoling,
              europely_source: europely,
            }
            this.body = yield render('show_source', content)
          } else {
            let content = {
              ipiaoling_source : ipiaoling,
              europely_source: europely,
            }
            this.body = content
          }          
        } else {
          let content = {
              title: '登录系统',
              error_info: 'no',
           }
           this.body = yield render('/login', content)
        }
    },

 }

function add_source(source, response) {
  response.source_name.push(source.source_name)
  response.created_at.push(new Date(source.created_at))
  return response
}

//if url without params ,month=-1 (0-11 are available), year = 0  
function stats_source(source, params) {
  let  totle_count = {}
  let month = _.pick(params, 'month')
  let year = _.pick(params, 'year')
  let i = 0
  source.source_name.forEach(function(name) { 
    //if have month or year , we need to consider
     if (((_.isEmpty(month)) || (month['month'] == source.created_at[i].getUTCMonth())) && (( _.isEmpty(year)) || (year['year'] == source.created_at[i].getUTCFullYear()))) {
         if (_.has(totle_count ,name)) { 
              totle_count[name] += 1
            } else {
              totle_count[name] = 1
            }
        }
    i = i+1
    })
  return totle_count
}