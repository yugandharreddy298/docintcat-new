/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Fieldoption = require('./fieldoption.model');

exports.register = function(socket) {
  Fieldoption.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Fieldoption.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('fieldoption:save', doc);
  // socket.broadcast.emit('fieldoption:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('fieldoption:remove', doc);
  // socket.broadcast.emit('fieldoption:remove', doc);
}