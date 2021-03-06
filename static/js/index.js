imageUrls = [];
curIndex = -1;

(function($){
$('#uploadImageBtn').on('click', function(){
  uploadEvent(function( results ) {
    var isFirst = true;
    for (var i = 0; i < results.length; i++) {
      let result = results[i];
      if ( result && result.success && result.pictureUrl ) {
        imageUrls.push(result.pictureUrl);
        if (isFirst) {
          curIndex = imageUrls.length - 1;
          // document.getElementById('imagePreview').innerHTML = '<img src="'+ result.pictureUrl +'" style="max-width: 100%">';
          loadImage(imageUrls[curIndex]);
          isFirst = false;
        }
      }
    }
  })
})

 /**
  * upload event
  * @param {function} success success function
  */
function uploadEvent(success) {
  let formData = new FormData()
  let input = document.createElement('input')
  input.setAttribute("multiple","");
  input.setAttribute('type', 'file')
  input.setAttribute('name', 'files')
  input.click()
  input.onchange = function () {
    for (var i = 0; i < input.files.length; i++) {
      formData.append('files', input.files[i])
    }
    requestEvent(formData, success);
  }
}

 /**
  * 
  * @param {object} formData filesData
  * @param {function} success success function
  */
function requestEvent( formData, success ) {
  try {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
      if ( xhr.readyState === 4 && xhr.status === 200 ) {
        success(JSON.parse(xhr.responseText))
      } 
    }
    xhr.open('post', '/api/image/upload')
    xhr.send(formData)
  } catch ( err ) {
    console.log("upload err");
  }
}


$('#last_image').on('click', function(){
  if (imageUrls.length === 0) {
    return;
  }
  curIndex -= 1;
  if (curIndex == -1) {
    curIndex = imageUrls.length - 1;
  }
  loadImage(imageUrls[curIndex]);
})

$('#next_image').on('click', function(){
  if (imageUrls.length === 0) {
    return;
  }
  curIndex += 1;
  if (curIndex == imageUrls.length) {
    curIndex = 0;
  }
  loadImage(imageUrls[curIndex]);
})

function loadImage( imagesUrl ){
  $('#imagePreview').annotate([imagesUrl]);
}

})(jQuery);