/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Mobilelink = require('./mobilelink.model');

exports.register = function(socket) {
  Mobilelink.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Mobilelink.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('mobilelink:save', doc);
  // socket.broadcast.emit('mobilelink:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('mobilelink:remove', doc);
  // socket.broadcast.emit('mobilelink:remove', doc);
}