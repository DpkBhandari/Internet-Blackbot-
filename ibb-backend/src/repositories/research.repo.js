const Research = require('../models/Research');
exports.create = (data) => Research.create(data);
exports.byId = (id) => Research.findById(id);
exports.byUser = (userId, opts) => Research.find({ user: userId }).sort('-createdAt').skip(opts.skip).limit(opts.limit);
exports.search = (filter, opts) => Research.find(filter).sort(opts.sort || '-createdAt').skip(opts.skip).limit(opts.limit);
exports.count = (filter) => Research.countDocuments(filter);
