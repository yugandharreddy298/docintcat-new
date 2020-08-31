/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Favorite = require('./favorite.model');

exports.register = function(socket) {
  Favorite.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Favorite.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('favorite:save', doc);
  // socket.broadcast.emit('favorite:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('favorite:remove', doc);
  // socket.broadcast.emit('favorite:remove', doc);
}