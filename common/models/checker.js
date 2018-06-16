'use strict';
let assert = require('assert');
let pythonBridge = require('python-bridge');

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
        err = new Error('Unable to reach the provided URL');
        err.statusCode = 404;
      } else if (errorType == 'NameError') {
        err = new Error('Please check your file and try again');
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
};
