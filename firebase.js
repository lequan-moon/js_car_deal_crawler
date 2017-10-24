const photoDir = './photos/';
const fs = require('fs');

var config = {
apiKey: "AIzaSyD3KrD37jXdw0Ug-eESDtbwVXl2WPeMtO8",
authDomain: "ad27cardeal-178019.firebaseapp.com",
databaseURL: "https://ad27cardeal-178019.firebaseio.com",
projectId: "ad27cardeal-178019",
storageBucket: "ad27cardeal-178019.appspot.com",
messagingSenderId: "596983284900"
};

var blobUtil = require('blob-util');
var firebase = require('firebase');
require('firebase/storage');
require('firebase/database');
// var File = require('File');

var app = firebase.initializeApp(config);

var storageRef = app.storage().ref();

fs.readdir(photoDir, (err, files) => {
  files.forEach(fileName => {
    
 //    var file = new File(photoDir + fileName);
 //    console.log(file);

 //    var metadata = {
	//   contentType: 'image/jpg'
	// };
 //    var fileRef = storageRef.child(fileName);
 //    fileRef.put(file, metadata).then(function(snapshot){
	// 	console.log(snapshot.downloadURL);
	// });
    // blobUtil.imgSrcToBlob('http://static.muabanxe.com/media/pictures/thumb1/ban-xe-audi-a4-1-8at-2010-85fc9128ce.jpg', true).then(function (blob){
    blobUtil.imgSrcToBlob('./photos/11346-chao-thit-heo.jpg', true).then(function (blob){
    	console.log(blob);
  //   	var metadata = {
		//   contentType: 'image/jpg'
		// };

		// var fileRef = storageRef.child(fileName);
		// fileRef.put(blob, metadata).then(function(snapshot){
		// 	console.log(snapshot.downloadURL);
		// });
    }).catch(function(err){
    	console.log(err);
    });
  });
})