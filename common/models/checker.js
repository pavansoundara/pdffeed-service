'use strict';
var CONTAINERS_URL = '/api/containers/';
let pythonBridge = require('python-bridge');
const domainPing = require('domain-ping');
let linkCheck = require('link-check');
// let assert = require('assert');
var validator = require('validator');
let url = require('url');

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
        python.end();
        cb(null, x);
      }
    }).catch(error => {
      let errorType = error.exception.type.name;
      let err;

      switch (errorType) {
        case 'PDFSyntaxError':
          err = new Error('Document should be of PDF format/type.');
          err.statusCode = 400;
          break;
        case 'URLError':
          err = new Error('Unable to reach the provided URL.');
          err.statusCode = 404;
          break;
        case 'NameError':
          err = new Error('Please check your file and try again.');
          err.statusCode = 400;
          break;
        case 'HTTPError':
          err = new Error('File not found at provided URL.');
          err.statusCode = 404;
          break;
        case 'IOError':
          err = new Error('File not found on the server');
          err.statusCode = 404;
          break;
        case 'ValueError':
          err = new Error(error.exception.message);
          err.statusCode = 400;
          break;
        default:
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
    /* Future Work: Clean up and rejecting promises aptly */
    function checkSingleLink(link) {
      return new Promise((resolve, reject) => {
        /* Future work: Clean up! */
        let adr = link.replace(/[${}|[\]\\<>]/g, '');

        /* https://www.regextester.com/94502 */
        let matchUrl = adr.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g);
        // let matchUrl = validator.isURL(adr);
        if (matchUrl == null || matchUrl < 1) {
          resolve({
            'link': adr,
            'status': null,
          });
        }

        if (!adr.match(/^[a-zA-Z]+:\/\//)) {
          adr = 'http://' + adr;
        }

        let q = url.parse(adr, true);
        /* Future work: Combine both packages into one for easier implementation */
        domainPing(q.host)
          .then(res =>{
            if (res.success || res.ping) {
              if (adr.search(/linkedin.com/i) > 0) {
                resolve({
                  'link': adr,
                  'status': null,
                });
              } else {
                linkCheck(adr, function(err, result) {
                  if (err) {
                    return err;
                  }
                  resolve({
                    'link': result.link,
                    'status': result.status,
                  });
                });
              }
            } else {
              resolve({
                'link': adr,
                'status': res.statusCode,
              });
            }
          }).catch(err => {
            let customErr = {
              link: adr,
              status: '',
            };

            if (err.error.substr(0, 20) == 'Exceeded maxRedirect') {
              customErr.status = 'exceeded max redirects';
            } else if (err.error == 'unable to verify the first certificate') {
              customErr.status = 'unable to verify certificate';
            } else {
              customErr.status = 'address unreachable';
            }
            resolve(customErr);
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

    filterLinks(links).then(filteredLinks => {
      cb(null, filteredLinks);
    }).catch(error => {
      let err = new Error('Something went wrong. Please try again.');
      err.statusCode = 501;
    });
  };

  Checker.remoteMethod(
    'checkLinks', {
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
    }
  );
};
