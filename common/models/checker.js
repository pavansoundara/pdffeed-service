'use strict';
let assert = require('assert');
let pythonBridge = require('python-bridge');
let linkCheck = require('link-check');
let url = require('url');
let ping = require('ping');

module.exports = function(Checker) {
  Checker.getLinks = function(URL, cb) {
    let urls = [URL];
    /* Python Bridge Part */
    let python = pythonBridge();
    python.ex `import pdffeed`;
    python.ex `
        def getLinks(url):
          links = []
          try:
              links = pdffeed.feeder(url)
          except Exception as e:
              raise
          return links
        `;
    /* Python Bridge part Ends */
    python `getLinks(${urls})`.then(x => {
      if (x == null || x.length < 1) {
        x = [];
        cb(null, x);
      } else {
        var response = x;
        python.end();
        cb(null, response);
      }
    }).catch(error => {
      let errorType = error.exception.type.name;
      let err;
      console.log(error.exception);
      if (errorType == 'PDFSyntaxError') {
        err = new Error('Document should be of PDF format/type.');
        err.statusCode = 400;
      } else if (errorType == 'URLError') {
        err = new Error('Unable to reach the provided URL.');
        err.statusCode = 404;
      } else if (errorType == 'NameError') {
        err = new Error('Please check your file and try again.');
        err.statusCode = 400;
      } else if (errorType == 'HTTPError') {
        err = new Error('File not found.');
        err.statusCode = 404;
      } else if (errorType == 'IOError') {
        err = new Error('File not found locally');
        err.statusCode = 404;
      } else if (errorType == 'ValueError') {
        err = new Error(error.exception.message);
        err.statusCode = 400;
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
      verb: 'post',
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
