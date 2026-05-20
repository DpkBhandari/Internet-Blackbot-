const User = require('../models/User');
exports.create = ({ name, email, password }) => User.create({ name, email, password });
exports.findByEmail = (email) => User.findOne({ email });
exports.findById = (id) => User.findById(id);
exports.update = (id, update) => User.findByIdAndUpdate(id, update, { new: true });
