const Koa = require('koa')
const views = require('koa-views')
const path = require('path') 
const static = require('koa-static')
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
  } else {
    ctx.body = '<h1>404 not found</h1>';
  }
});


app.listen(PORT, () => {
  console.log('[demo] Image annotation tool is starting at port '+PORT);
});

