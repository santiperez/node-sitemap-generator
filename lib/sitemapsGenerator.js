var ejs = require('ejs');
var Q = require('q');
var fs = require('fs');
var path = require('path');

var conf={
    domain:'',
    debug:true
};

var urlsRegistered=new Array();
var sitemapFiles=new Array();

var SitemapsGenerator = function(domain,debug) {
    if(domain!=undefined){
        conf.domain=(domain.slice(-1)=='/')?domain.substring(0, domain.length - 1):domain;
        conf.debug=(debug===true)?true:false;
    }
    return this;
};

exports.init = function(domain,debug) {
    return new SitemapsGenerator(domain,debug);
};

SitemapsGenerator.prototype.reset=function(){
   urlsRegistered=new Array();
   sitemapFiles=new Array();
}

SitemapsGenerator.prototype.createSitemapFromMethod=function(fullPath,func,args){
    sitemapFiles.push(fullPath);
    var deferred = Q.defer();
    var relativeUrls=func.apply(null,args)
    createSitemap(fullPath,relativeUrls);
    deferred.resolve(relativeUrls);
    deferred.reject([]);
    return deferred.promise;
};

SitemapsGenerator.prototype.createSitemapFromAsyncMethod=function(fullPath,func,args){
    sitemapFiles.push(fullPath);
    var deferred = Q.defer();
    Q.nfapply(func, args).done(function(relativeUrls){
        createSitemap(fullPath, relativeUrls);
        deferred.resolve(relativeUrls);
        deferred.reject([]);
    });
    return deferred.promise;
}

SitemapsGenerator.prototype.createSitemap = function(fullPath,relativeUrls){
    var deferred = Q.defer();
    createSitemap(fullPath,relativeUrls);
    deferred.resolve(relativeUrls);
    deferred.reject([]);
    return deferred.promise;
}

SitemapsGenerator.prototype.generateSitemapIndex=function(fullPath){

    var refPath=new Array();
    sitemapFiles.forEach(function(url){
        var filename = url.replace(/^.*[\\\/]/, '')
        refPath.push(conf.domain+'/'+filename);
    });
    createSitemapFile(fullPath,refPath,true);
}

SitemapsGenerator.prototype.getSitemapsUrls=function(){
    return  urlsRegistered;
}

SitemapsGenerator.prototype.exportSitemapsUrls=function(fullpath){
    fs.writeFileSync(fullpath, JSON.stringify(urlsRegistered));
}

function createSitemap(fullPath,relativeUrls){

    var absUrls=[];
    relativeUrls.forEach(function(url){
        absUrls.push(conf.domain+'/'+url);
    });

    createSitemapFile(fullPath,absUrls,false);
};

function createSitemapFile(fullPath,refs,isIndex){
    var data={urls:refs};
    var content;
    if(isIndex==undefined || isIndex==false) {
        content = ejs.render(fs.readFileSync(path.join(__dirname,'..','lib','templates', 'sitemapTemplate.ejs'), 'utf-8'), data);
    }else{
        content = ejs.render(fs.readFileSync(path.join(__dirname,'..','lib','templates', 'sitemapIndexTemplate.ejs'), 'utf-8'), data);
    }

    try {
        fs.writeFileSync(fullPath, content);
        if(fullPath.indexOf('.xml')==-1) {
            sitemapFiles.push(fullPath);
        }
        urlsRegistered=urlsRegistered.concat(refs);
        if(conf.debug) {
            console.log("node-sitemap-generator [lib/sitemapGenerator.js]", "The sitemap " + fullPath + " was saved!", "urls",refs);
        }
    }catch(err){
            console.error("node-sitemap-generator [lib/sitemapGenerator.js]", err);
    }
}
