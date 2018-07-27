var mongoose = require('mongoose');

var MerchantSchema = new mongoose.Schema({
  merchantname: {type: String, required: true, unique: true},
  contactname: {type: String, required: true},
  phonenumber: String,
  workaddress: {type: String, required: true},
  worknumber: {type: String, required: true},
  cacnumber: {type: String, required: true, unique: true},
  industrytype: String,
  pelfid: String,
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  balance: {type: Number, default: 0.00},
  img_path: {type: String, default: 'uploads/merchant-placeholder.png'},
  Created_date: {type: Date, default: Date.now}
});
mongoose.model('Merchant', MerchantSchema);

module.exports = mongoose.model('Merchant');
