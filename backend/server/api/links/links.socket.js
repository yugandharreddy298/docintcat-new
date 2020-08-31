/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Links = require('./links.model');

exports.register = function(socket) {
  Links.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Links.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('links:save', doc);
  // socket.broadcast.emit('links:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('links:remove', doc);
  // socket.broadcast.emit('links:remove', doc);
}