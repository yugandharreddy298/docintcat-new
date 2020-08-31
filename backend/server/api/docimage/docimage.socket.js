/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Docimage = require('./docimage.model');

exports.register = function(socket) {
  Docimage.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Docimage.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('docimage:save', doc);
  // socket.broadcast.emit('docimage:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('docimage:remove', doc);
  // socket.broadcast.emit('docimage:remove', doc);
}