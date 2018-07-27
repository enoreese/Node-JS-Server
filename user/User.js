var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
var UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  phonenumber: String,
  pelfid: {type: String, unique: true},
  pin: {type: String, required: true, select: true},
  email: String,
  password: String,
  balance: {type: Number, default: 8000.00},
  img_path: {type: String},
  Created_date: {type: Date, default: Date.now}
});

// Getter
UserSchema.path('balance').get(function(num) {
  return (num).toFixed(2);
});

// Setter
UserSchema.path('balance').set(function(num) {
  return num;
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');
