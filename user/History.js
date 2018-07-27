var mongoose = require('mongoose');
var HistorySchema = new mongoose.Schema({
  userid: String,
  amount: String,
  merchantid: String,
  merchantname: String,
  description: String,
  img_path: {type: String, default: 'uploads/merchant-placeholder.png'},
  Created_date: {type: Date, default: Date.now}
});
mongoose.model('History', HistorySchema);

module.exports = mongoose.model('History');
