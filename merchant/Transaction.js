var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({
  merchantname: {type: String, required: true},
  merchantid: {type: String, required: true},
  amount: {type: String, required: true},
  redirecturl: String,
  description: {type: String, required: true},
  Created_date: {type: Date, default: Date.now},
  status: {type: [{
      type: String, enum: ['pending', 'completed']}],
    default: ['pending']}
});
mongoose.model('Transaction', TransactionSchema);

module.exports = mongoose.model('Transaction');
