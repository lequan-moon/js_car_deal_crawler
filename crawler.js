var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
const mime = require('mime');
const bucketName = 'ad27cardeal-178019.appspot.com';
const photoDir = './photos/';

var admin = require("firebase-admin");

var serviceAccount = require("./ad27cardeal-178019-firebase-adminsdk-e7swj-185cba748b.json");

var app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ad27cardeal-178019.firebaseio.com"
});

var mStorage = app.storage();
var bucket = mStorage.bucket(bucketName);

var mRealtimeDB = app.database();
var dealRef = mRealtimeDB.ref("deals/bonbanh");

var baseUrl = "https://bonbanh.com/"

var pagesToVisit = [];
var typeDetailPagesToVisit = [];
var imageForUpload = [];

// main process
// pagesToVisit.push(
// 	"https://bonbanh.com/oto/page,1",
// 	"https://bonbanh.com/oto/page,2", 
// 	"https://bonbanh.com/oto/page,3", 
// 	"https://bonbanh.com/oto/page,4", 
// 	"https://bonbanh.com/oto/page,5", 
// 	"https://bonbanh.com/oto/page,6", 
// 	"https://bonbanh.com/oto/page,7", 
// 	"https://bonbanh.com/oto/page,8", 
// 	"https://bonbanh.com/oto/page,9", 
// 	"https://bonbanh.com/oto/page,10"
// 	);
crawl();

function crawl() {
	var nextPage = pagesToVisit.shift();
	if (nextPage != null) {
		visitPage(nextPage);
	} else {
		// Crawled all page done
		// Begin upload images
		fs.readdir(photoDir, (err, files) => {
		  files.forEach(fileName => {
		  	imageForUpload.push(fileName);
		  });
		});
		processUpload();
	}
}

function processUpload() {
	var fileName = imageForUpload.shift();
	uploadImageToFirebase(photoDir + fileName, fileName);
}

function visitPage(pageUrl) {
	console.log("Visiting page " + pageUrl);
	request({
		headers: {
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
		},
		uri: pageUrl,
		method: 'GET'
	}, function(error, response, body) {
	   if(error) {
	     console.log("Error: " + error);
	     setTimeout(crawl, 3000);
	   }
	   // Check status code (200 is HTTP OK)
	   console.log("Status code: " + response.statusCode);
	   if(response.statusCode === 200) {
	     // Parse the document body
	     var $ = cheerio.load(body);

	     // Check if page is List page then collect detail link
	     // Else is a detail page then collect needed data
	     if (pageUrl.indexOf("page") > -1) {
	     	// Crawl all deal url in the page
	     	collectDetailPageLink($);
	     	setTimeout(crawl, 3000);
	     } else {
	     	collectData($);
	     }
	   }
	});	
}

function collectData($) {
	// Collect data
	var brand = $(".breadcrum > a > strong")[0].children[0].data;
	var carType = $("#sgg").find("#mail_parent > .txt_input > span")[2].children[0].data;
	var dealerName = $(".contact-box").find(".contact-txt > .cname").text();
	var dealerPhoneNumber = $(".contact-box").find(".contact-txt > .cphone").text();
	var slogan = $(".car_des > .des_txt").text();
	var dealName = $(".title").text();
	var address = $(".contact-txt").text();

	// Collect images
	var listImages = [];
	var images = $(".highslide-gallery").find("img");
	images.each(function (){
		var imageUrl = $(this).attr('src');
		var fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
		listImages.push(createPublicFileURL(fileName));
		var filePath = "./photos/" + imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
		download(imageUrl, filePath, function(){});
	});

	var object = {id:guid()};
	object["brand"] = brand;
	object["carType"] = carType;
	object["dealerName"] = dealerName;
	object["dealerPhoneNumber"] = dealerPhoneNumber;
	object["slogan"] = slogan;
	object["dealName"] = dealName;
	object["address"] = address;
	object["images"] = listImages;

	insertRecord(object);
}

function collectDetailPageLink($) {
	var relativeLinks = $("#search_content").find("a");
    relativeLinks.each(function() {
    	var urlToVisit = baseUrl + $(this).attr('href');
    	if (!(urlToVisit.indexOf("javascript") > -1)) {
			console.log(urlToVisit);
	        pagesToVisit.push(urlToVisit);
    	}
    });
}

function collectPagingLink($) {
	var pagingUrl = $("ul.pagination").find("li > a");
    pagingUrl.each(function() {
    	var urlToVisit = $(this).attr('href');
    	if (!(pagesToVisit.indexOf(urlToVisit) > -1)) {
    		console.log(urlToVisit);
        	pagesToVisit.push(urlToVisit);
    	}
    });
}

function uploadImageToFirebase(filePath, uploadTo) {
	console.log("Uploading: " + filePath);
	fileMime = mime.getType(filePath);
	// Upload image
	bucket.upload(filePath,{
		destination:uploadTo,
		public:true,
		metadata: {contentType: fileMime,cacheControl: "public, max-age=300"}
	}, function(err, file) {
		if(err)
		{
		    console.log(err);
		    return;
		}
		processUpload();
		return createPublicFileURL(uploadTo);
	});
}

function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('Downloading: ' + uri);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function createPublicFileURL(storageName) {
    return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function insertRecord(object) {
	console.log("Begin insert object:" + object.id);
	dealRef.child(object.id).set(object, function(error){
		if (error) {
		    console.log("Data could not be saved." + error);
		  } else {
		    console.log("Data saved successfully.");
		    setTimeout(crawl, 3000);
		  }
	});
}