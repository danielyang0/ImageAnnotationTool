# ImageAnnotationTool
An application that lets the user load images from the user's local  disk, view, resize and annotate them.


#summary

Image annotation tool is an application that lets the user load images from the user's local disk, view, resize and annotate them.This tool will be self-sufficient, which means, it will run as expected on any operating system, and in the absence of internet connection.

#techniques
Image Annotation Tool uses node.js, koa 2 as backend.
In order to keep the application simple to use, no database tool is used to store the annoatation data so that users will not need to install mysql or mongoDB.
Instead, text files are used to store the annoation data.

In the front end, jQuery, bootstrap is used.

#functionality
1. Upload multiple files at a time to the server, and these files will be added to current session incrementally. (A session is a bunch of image files for the user to annotate)
These file will be saved as random names on the server.
2. Users can navigate images in current session.
3. Two types of annotations are enabled: rectangle and text
4. Annotations can be saved to the server automatically when navigating away from current images or toggling annotation tool. Annotations can be saved manually through a button as well.
5. Annotation data will be saved to the same directory as the image files (```${root}/static/image/annotations/```), with the same file name except that the extension is changed to .json
6. Users can undo and redo annotation on an image


#usage

prerequisite: install node(version >= 7.6) and npm(version >= 3.0)

1. clone this repo
2. go to root folder of this project, install dependencies: 
    ```$ npm install```
3. run the application: ```$ npm start ```
    or ,      ```$ node server.js```
4. In the browser, visit http://localhost:8080/ to use the application 


#follow up
1. develop an API to delete image files in ```${root}/static/image/annotations/```
2. reload image files and annotation from server in the previous sessions.
