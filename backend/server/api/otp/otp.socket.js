/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Otp = require('./otp.model');

exports.register = function(socket) {
  Otp.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Otp.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('otp:save', doc);
  // socket.broadcast.emit('otp:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('otp:remove', doc);
  // socket.broadcast.emit('otp:remove', doc);
}