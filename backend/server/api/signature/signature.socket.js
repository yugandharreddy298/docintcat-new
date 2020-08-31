/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Signature = require('./signature.model');

exports.register = function(socket) {
  Signature.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Signature.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('signature:save', doc);
  // socket.broadcast.emit('signature:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('signature:remove', doc);
  // socket.broadcast.emit('signature:remove', doc);
}