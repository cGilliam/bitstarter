#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

// Global Variables
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');

// User flag defaults
var URLFILE_DEFAULT = "";
var CHECKSFILE_DEFAULT = "checks.json";
var HTMLFILE_DEFAULT = "index.html";



var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
   return JSON.parse(fs.readFileSync(checksfile));
};


// parses html file coming from cheerio for the listed JSON flags
var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};


// Converts input, such as URL, to string
var toString = function(input) {
    var str = input.toString();
    return str;
};


// Workaround for commander.js issue.
// http://stackoverflow.com/a/6772648
var clone = function(fn) {
    return fn.bind({});
};


// Function uses cheerio to parse a html page loaded by restler
var cheerioUrl = function(page) {
   return cheerio.load(page);
};


// parses the page loaded by cheerio using flags from JSON file 
var checkURL = function(page, checksfile) {
    var $ = cheerioUrl(page);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for( var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
return out;
};   


// Processes the restler output of getURL due to restler working asynchronously
var getURL2 = function(url, checks) {
    var checkJson = checkURL(url, checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    return outJson;
};


// restler asynchronously gets the URL and sends to getURL2
var getURL = function(URLstr) {
    var rest = require('restler');
    rest.get(URLstr).on('complete', function(result) {
        if (result instanceof Error) {
            console.log('Restler failed to import the URL');
            process.exit(1);
        } else {
            console.log(getURL2(result, program.checks));
            process.exit(1);
       }
    });
};



if(require.main == module) {
    program
        .option('-u, --url <url_path>', 'URL to be checked', clone(toString), URLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .parse(process.argv);
    
    if(program.url !== "") {
        getURL(program.url);

    } else {
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    }
        
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
