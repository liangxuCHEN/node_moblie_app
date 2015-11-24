'use strict'

var txt1 = '客人信息(甲方)\n负责人姓名: \n  王淼 WANG MIAO 护照号:G39402641\n  殷璐  YIN   LU    护照号:G38047829\n  姚璐  YAO   LU    护照号:G29687902\n  谢雨霏 XIE YUFEI 护照号:E45737022\n联系方式:\n  王淼13910974939,殷璐13801082548'
var txt2 = 'AVIGNON GRAND HOTEL 34,BD SAINT-ROCH,84000 FTANCE'

var parse = require('co-body')
//require dependencies
var PDFDocument = require('pdfkit')
//var blobStream  = require ('blob-stream')

var fs = require('fs')
//create a document the same way as above
exports.contact = {
  generatorPDF: function *() {
  // create a document and pipe to a blob
    var doc = new PDFDocument()

    // See below for browser usage
    // pipe the document to a blob
    //var stream = doc.pipe(blobStream());

    doc.pipe(fs.createWriteStream('contactPDF/output-2.pdf'))
    // draw some text
    //doc.font('Times-Roman')
    doc.font('myTTF.ttf', 20)
       .text('法国环欧旅游 接待合同', {align : 'center',})

    doc.moveDown()
          .fontSize(13)
          .text('合同编号：0707201501', 300) 

    doc.moveDown()
          .fontSize(10)
          .text ('根据国家有关旅游事业管理的规定，甲乙双方经协商一致，签订本合同，共同信守执行。 ' , 80)

    doc.moveDown()
       .moveDown()
       .fontSize(13)
       .text(txt1, {
         align: 'left',
         indent: 30,
       })

    doc.moveDown()
       //.font('Times-Roman')
       .text(txt2, {
         align: 'left',
         indent: 30,
       })

       
   
    // end and display the document in the iframe to the right
    doc.end()

  /*  stream.on ('finish',  function() {
      //get a blob you can do whatever you like with
      //blob = stream.toBlob('application/pdf')
      
      //or get a blob URL for display in the browser
      url = stream.toBlobURL('application/pdf')
      iframe.src = url
    })
   */
  },

  readAllFile : function *() {
    let files = fs.readdirSync('contactPDF')
    let content = {
      file_names: files,
      title: 'contact List',
    }
    console.log(content)
    this.body  = yield render('contactList', content)
  },

  downFile : function *() {
    this.body = fs.createReadStream('contactPDF/'+ this.params.file_name)
    //this.redirect('/allContacts')
   }, 
}

   
