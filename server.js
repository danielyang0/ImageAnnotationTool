const Koa = require('koa')
const views = require('koa-views')
const path = require('path') 
const static = require('koa-static')
const fs = require('fs')
const { uploadFile } = require('./util/upload')

const app = new Koa()

PORT = 8080;

app.use(views(path.join(__dirname, './view'), {
  extension: 'ejs'
}))

// static resources folder position, relative to server.js
const staticPath = './static' 

app.use(static(
  path.join( __dirname,  staticPath)
));

app.use( async ( ctx ) => {
  if (ctx.url === '/' && ctx.method === 'GET' ) {
    let title = 'Image Annotation Tool';
    await ctx.render('index', {
      title
    });
  } else if ( ctx.url === '/api/image/upload' && ctx.method === 'POST' ) {
    // get the folder where image files are stored
    let fileFolderPath = path.join( __dirname, 'static/image' )

    // saving uploaded files to storage 
    results = await uploadFile( ctx, {
      path: fileFolderPath,
      fileCategory: 'annotations'
    })
    //return the files' urls
    ctx.body = results
  } else if (ctx.url === '/api/image/save' && ctx.method === 'POST') {
    let postData = await parsePostData( ctx )
    ctx.body = postData
    let annotationJsonFile = staticPath + '/' + postData.imagefileUrl.split(':' + PORT + '/')[1].split('.')[0] + '.json';
    fs.writeFile(annotationJsonFile, postData.annotateData, function (err) {
      if (err) {
          console.log(err);
      }
    });
  } else if (ctx.url.startsWith('/api/image/getAnnotation?') && ctx.method === 'GET') {
    let ctx_query = ctx.query;
    let annotationJsonFile = staticPath + '/' + ctx_query.imagefileUrl.split(':' + PORT + '/')[1].split('.')[0] + '.json';
    var annotationData = await retrieveAnnotation(annotationJsonFile);
    ctx.body = annotationData;
  } else {
    ctx.body = '<h1>404 not found</h1>';
  }
});

function parsePostData( ctx ) {
  return new Promise((resolve, reject) => {
    try {
      let postdata = "";
      ctx.req.addListener('data', (data) => {
        postdata += data
      })
      ctx.req.addListener("end",function(){
        let parseData = parseQueryStr( postdata )
        resolve( parseData )
      })
    } catch ( err ) {
      reject(err)
    }
  })
}

/**
 * parse post query string to json
 * @param {string} queryStr
 */
function parseQueryStr( queryStr ) {
  let queryData = {}
  let queryStrList = queryStr.split('&')
  for ( let [ index, queryStr ] of queryStrList.entries() ) {
    let itemList = queryStr.split('=')
    queryData[ itemList[0] ] = decodeURIComponent(itemList[1])
  }
  return queryData
}

/**
 * retrive data from annotation json file
 * @param {string} annotationJsonFile the annotation json file to read from
 */
function retrieveAnnotation (annotationJsonFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(annotationJsonFile, 'utf-8', function (err, data) {
      if (err) {
          resolve ('[]');
      } else {
        resolve(data);
      }
    });
  })
}


app.listen(PORT, () => {
  console.log('[demo] Image annotation tool is starting at port '+PORT);
});

