var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  merchantname: String,
  merchantid: String,
  merchantImgPath: {type: String, default: 'uploads/merchant-placeholder.png'},
  postCaption: String,
  postImgPath: String,
  postType: String,
  Created_date: {type: Date, default: Date.now},
  likes: {type: Number, default: 0}
});
mongoose.model('Post', PostSchema);

module.exports = mongoose.model('Post');
