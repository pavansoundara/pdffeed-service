'use strict';
let assert = require('assert');
let pythonBridge = require('python-bridge');
let linkCheck = require('link-check');
let url = require('url');
let ping = require('ping');

module.exports = function(Checker) {
  Checker.getLinks = function(URL, cb) {
    /* Python Bridge Part */
    let python = pythonBridge();
    python.ex `import pdfx`;
    python.ex `
        def getLinks(url):
            pdf = pdfx.PDFx(url)
            return pdf.get_references_as_dict()
    `;
    /* Python Bridge part Ends */
    python `getLinks(${URL})`.then(x => {
      var response = x;
      python.end();
      cb(null, response.url);
    }).catch(error => {
      let errorType = error.exception.type.name;
      let err;
      console.log(errorType);
      if (errorType == 'PDFInvalidError') {
        err = new Error('Document should be of PDF format/type.');
        err.statusCode = 400;
      } else if (errorType == 'DownloadError') {
        err = new Error('Unable to reach the provided URL.');
        err.statusCode = 404;
      } else if (errorType == 'NameError') {
        err = new Error('Please check your file and try again.');
        err.statusCode = 400;
      } else if (errorType == 'FileNotFoundError') {
        err = new Error('File not found.');
        err.statusCode = 404;
      } else {
        err = new Error('Something went wrong. Please try again.');
        err.statusCode = 501;
      }
      cb(err);
    });
  };

  Checker.remoteMethod(
    'getLinks', {
      http: {
        path: '/getlinks',
        verb: 'get',
      },
      accepts: {
        arg: 'url',
        type: 'string',
        http: {
          source: 'query',
        },
      },
      returns: {
        arg: 'links',
        type: 'array',
      },
    }
  );

  Checker.checkLinks = function(links, cb) {
    function checkSingleLink(link) {
      return new Promise((resolve, reject) => {
        let adr = link.replace(/[${}|[\]\\<>]/g, '');
        /* https://www.regextester.com/94502 */
        let matchUrl = adr.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g);
        if (matchUrl == null || matchUrl.length < 1) {
          resolve({
            'link': adr,
            'status': null,
          });
        }
        let q = url.parse(adr, true);
        ping.sys.probe(q.host, function(isAlive) {
          if (isAlive) {
            if (adr.search(/linkedin.com/i) > 0) {
              resolve({
                'link': adr,
                'status': null,
              });
            }
            linkCheck(adr, function(err, result) {
              if (err) {
                return err;
              }
              resolve({
                'link': result.link,
                'status': result.status,
              });
            });
          } else {
            resolve({
              'link': adr,
              'status': 404,
            });
          }
        });
      });
    }

    function checkMultipleLinks(links) {
      const arrayOfPromises = links.map(link => checkSingleLink(link));
      return Promise.all(arrayOfPromises);
    }

    function filterLinks(links) {
      return new Promise((resolve, reject) => {
        checkMultipleLinks(links).then(response => {
          resolve(response);
        });
      });
    }
    console.log(links);
    filterLinks(links).then(filteredLinks => {
      console.log(filteredLinks);
      cb(null, filteredLinks);
    });
  };

  Checker.remoteMethod('checkLinks', {
    http: {
      path: '/checkLinks',
      verb: 'get',
      source: 'body',
    },
    accepts: {
      arg: 'links',
      type: 'array',
    },
    returns: {
      arg: 'links',
      type: 'array',
    },
  });
};
