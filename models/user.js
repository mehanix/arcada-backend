const mongoose = require('mongoose');

const User = new mongoose.Schema({
    email: String,
    password: String,
  })

  module.exports = mongoose.model('user', User)