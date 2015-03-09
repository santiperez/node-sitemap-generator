var sG = require('../lib/siteMapsGenerator.js');
var path= require('path');
var Q = require('q');


sitemapsGenerator = sG.init('http://example.com',true);

var basePath=path.join(__dirname,'bin');

var promise = Q.all([
    sitemapsGenerator.createSitemap(path.join(basePath,'sitemap1.xml'),['level1','level2','level1/level11','level1/level12','level2/level21']),
    sitemapsGenerator.createSitemapFromAsyncMethod(path.join(basePath,'sitemap2.xml'), getAsyncUrls,['customParam1','customParam2']),
    sitemapsGenerator.createSitemapFromMethod(path.join(basePath,'sitemap3.xml'), getUrls,['customParam3','customParam4'])
]).then(function(results){
    sitemapsGenerator.generateSitemapIndex(path.join(basePath,'sitemap.xml'));
    sitemapsGenerator.exportSitemapsUrls(path.join(basePath,'urls.json'));
});

function getAsyncUrls(arg1,arg2,cb){

    var r=[];
    setTimeout(function(){
        r.push(arg1+'/'+arg2);
        r.push(arg2+'/'+arg1);
        cb(null,r);
    }, 3000);
}

function getUrls(arg1,arg2){
    var r=[];
    r.push(arg1+'/'+arg2);
    r.push(arg2+'/'+arg1);
    return r;
}
