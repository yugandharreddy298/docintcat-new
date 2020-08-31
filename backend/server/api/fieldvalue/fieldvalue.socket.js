/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Fieldvalue = require('./fieldvalue.model');

exports.register = function(socket) {
  Fieldvalue.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Fieldvalue.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('fieldvalue:save', doc);
  // socket.broadcast.emit('fieldvalue:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('fieldvalue:remove', doc);
  // socket.broadcast.emit('fieldvalue:remove', doc);
}