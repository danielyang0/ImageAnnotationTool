const path = require('path')
const fs = require('fs')
const Busboy = require('busboy')

 /**
  * create folder
  * @param {*} dirname folder's absolute location
  */
 function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync( path.dirname(dirname)) ) {
      fs.mkdirSync( dirname )
      return true
    }
  }
}

 /**
  * get file's suffix
  * @param {string} fileName 
  */
function getFileSuffix( fileName ) {
  let nameList = fileName.split('.')
  return nameList[nameList.length - 1]
}

 /**
  * upload file
  * @param {object} ctx koa context
  * @param {object} options file category, the image folder location
  */
function uploadFile( ctx, options) {
  let req = ctx.req
  let res = ctx.res
  let busboy = new Busboy({headers: req.headers})

  let fileCategory = options.fileCategory || 'common'
  let folderPath = path.join( options.path,  fileCategory)
  //make directory if not existed
  mkdirsSync( folderPath )
  //results of all the uploading events: {success or not, uploaded file url}
  var results = []

  return new Promise((resolve, reject) => {
    console.log('file is uploading...')

    // parse file upload
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      let result = { 
        success: false,
        pictureUrl: null
      }
      let fileName = Math.random().toString(16).substr(2) + '.' + getFileSuffix(filename);
      let saveTo = path.join( folderPath, fileName );

      // save file to assigned location
      file.pipe(fs.createWriteStream(saveTo))

      // file writting end event
      file.on('end', function() {
        result.success = true;
        result.pictureUrl = `//${ctx.host}/image/${fileCategory}/${fileName}`;
        console.log('File uploaded succesfully!')
        results.push(result)
      })
    })

    // parse finish event
    busboy.on('finish', function( ) {
      resolve(results)
    })

    busboy.on('error', function(err) {
      console.log('file upload err')
      reject(results)
    })

    req.pipe(busboy)
  })
    
} 


module.exports =  {
  uploadFile
}
