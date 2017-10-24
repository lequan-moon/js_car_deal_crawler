const mime = require('mime');
const filePath = './photos/11346-chao-thit-heo.jpg';
const uploadTo = 'a/1200px-Good_Food_Display_-_NCI_Visuals_Online.jpg';
const fileMime = mime.getType(filePath);
const bucketName = 'ad27cardeal-178019.appspot.com';

var admin = require("firebase-admin");

var serviceAccount = require("./ad27cardeal-178019-firebase-adminsdk-e7swj-185cba748b.json");

var app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ad27cardeal-178019.firebaseio.com"
});

var mStorage = app.storage();
var bucket = mStorage.bucket(bucketName);

bucket.upload(filePath,{
    destination:uploadTo,
    public:true,
    metadata: {contentType: fileMime,cacheControl: "public, max-age=300"}
}, function(err, file) {
	console.log(file);
    if(err)
    {
        console.log(err);
        return;
    }
    console.log(createPublicFileURL(uploadTo));
});


function createPublicFileURL(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}