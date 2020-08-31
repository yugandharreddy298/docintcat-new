const { PDFArray, PDFIndirectObject, PDFObject } = require('pdf-lib');
const { arrayToString, addStringToBuffer } = require('pdf-lib/lib/utils');

const add = require('lodash/add');

/**
 * Extends PDFArray class in order to make ByteRange look like this:
 *  /ByteRange [0 /********** /********** /**********]
 * Not this:
 *  /ByteRange [ 0 /********** /********** /********** ]
 */
class PDFArrayCustom extends PDFArray {
  constructor(array, index) {
    super(array, index);

    this.bytesSize = function() {
      return (
        1 + // "["
        this.array
          .map(function(e) {
            if (e instanceof PDFIndirectObject)
              return e.toReference().length + 1;
            else if (e instanceof PDFObject) return e.bytesSize() + 1;
            throw new Error('Not a PDFObject: ' + e);
          })
          .reduce(add, 0)
      );
    };

    this.copyBytesInto = function(buffer) {
      let remaining = addStringToBuffer('[', buffer);
      this.array.forEach((e, idx) => {
        if (e instanceof PDFIndirectObject) {
          remaining = addStringToBuffer(e.toReference(), remaining);
        } else if (e instanceof PDFObject) {
          remaining = e.copyBytesInto(remaining);
        } else {
          throw new Error('Not a PDFObject: ' + e);
        }
        if (idx !== this.array.length - 1) {
          remaining = addStringToBuffer(' ', remaining);
        }
      });
      remaining = addStringToBuffer(']', remaining);
      return remaining;
    };
  }
}

module.exports = PDFArrayCustom;