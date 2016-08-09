/*
 * NodeJS module, included automatically from SourceJS app.js
 * ExpressJS middleware http://expressjs.com
 * */

var deepExtend = require('deep-extend');
var fs = require('fs-extra');
var path = require('path');
var cheerio = require('cheerio');

// Module configuration
var globalConfig = global.opts.plugins && global.opts.plugins.all ? global.opts.plugins.all : {};
var config = {
    enabled: true,

    // Public object is exposed to Front-end via options API.
    public: {}
};

// Overwriting base options
deepExtend(config, globalConfig);

/*
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
var processRequest = function (req, res, next) {
    if (!config.enabled) {
        next();
        return;
    }
        // Check if we're working with processed file
    if (req.specData && req.specData.renderedHtml) {
        if(req.specData.info.title===config.viewTitle){
            var data = req.specData.renderedHtml.replace(/^\s+|\s+$/g, '');
            var $ = cheerio.load(data, {decodeEntities: false});
            var headers = $('h1').not('.source_subhead h1').not('.source_example h1');

            headers.addClass('component_header');

            $('section').each(function(index, item){
                var html = $(item).html();
                $(html).insertAfter(item);
                $(item).remove();
            });

            headers.each(function(i,item){
                var section = $(item).nextUntil('h1.component_header');
                var wrapper = $("<section class='source_section'></section>");
                wrapper.insertAfter(item);
                var next = $(item).next();
                next.append(section);
                next.prepend(item);
            })

            $('h2').each(function(index, item){
                $(item).replaceWith($('<h3>'+$(this).text()+'</h3>'));
            });

            headers.each(function(index, item){
                $(item).replaceWith($('<h2 class="source_section_h">'+$(this).html()+'</h2>'));
            });

            req.specData.renderedHtml = $.html();
        }
        next(); 
    } else {
        // proceed to next middleware
        next();
    }
};

exports.process = processRequest;