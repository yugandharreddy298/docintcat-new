/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Usersession = require('./usersession.model');

exports.register = function(socket) {
  Usersession.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Usersession.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('usersession:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('usersession:remove', doc);
}