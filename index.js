const express = require('express');
const app = express();

const photoDir = './photos/';
const fs = require('fs');
var blobUtil = require('blob-util');

app.get('/', function (req, res) {
	console.log("Begin");
	fs.readdir(photoDir, (err, files) => {
	  files.forEach(fileName => {
	    console.log(fileName);
	    blobUtil.imgSrcToBlob().then(function (blob){
	    	console.log(blob);
	    });
	  });
	});
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});