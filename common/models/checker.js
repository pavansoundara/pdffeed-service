'use strict';
let assert = require('assert');
let pythonBridge = require('python-bridge');

let python = pythonBridge();

python.ex `import pdfx`;
let pdf;
let files;

python.ex `
    def getLinks(url):
        pdf = pdfx.PDFx(url)
        return pdf.get_references_as_dict()
`;

module.exports = function (Checker) {
  Checker.getLinks = function (URL, cb) {
    python `getLinks(${URL})`.then(x => {
      // assert.equal(x, a + b);
      var response = x;
      cb(null, response.url);
      console.log(response.url);
    });
  };
  Checker.remoteMethod(
    'getLinks', {
      http: {
        path: '/getlinks',
        verb: 'get'
      },
      accepts: {
        arg: 'url',
        type: 'string',
        http: {
          source: 'query'
        }
      },
      returns: {
        arg: 'links',
        type: 'array'
      }
    }
  );
};
