var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://muabanxe.com/ban-xe-o-to/ban-xe-du-lich/?b=1564";
var baseUrl = "http://muabanxe.com/"

var pagesToVisit = [];
var typeDetailPagesToVisit = [];

pagesToVisit.push(START_URL);
crawl();

function crawl() {
	var nextPage = pagesToVisit.shift();
	if (nextPage != null) {
		visitPage(nextPage);
	}
}


function visitPage(pageUrl) {
	console.log("Visiting page " + pageUrl);
	request(pageUrl, function(error, response, body) {
	   if(error) {
	     console.log("Error: " + error);
	     setTimeout(crawl, 3000);
	   }
	   // Check status code (200 is HTTP OK)
	   console.log("Status code: " + response.statusCode);
	   if(response.statusCode === 200) {
	   	count++;
	     // Parse the document body
	     var $ = cheerio.load(body);

	     // Crawl all deal url in the page
	     collectDetailPageLink($);
	     // crawl next page url
	     collectPagingLink($);
	     setTimeout(crawl, 3000);
	   }
	});	
}

function collectDetailPageLink($) {
	var relativeLinks = $("a.mcr-gl-link");
    relativeLinks.each(function() {
    	var urlToVisit = baseUrl + $(this).attr('href');
        console.log(urlToVisit);
        pagesToVisit.push(urlToVisit);
    });
}

function collectPagingLink($) {
	var pagingUrl = $("ul.pagination").find("a");
    pagingUrl.each(function() {
    	var urlToVisit = $(this).attr('href');
    	if (!(pagesToVisit.indexOf(urlToVisit) > -1)) {
    		console.log(urlToVisit);
        	pagesToVisit.push(urlToVisit);
    	}
    });
}
