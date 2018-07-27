var express = require('express');
var app = express()
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var User = require('../user/User');
var history = require('../user/History');
var Transaction = require('../merchant/Transaction')
var Merchant = require('../merchant/Merchant');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

router.post('/login', function(req, res) {

  User.findOne({ pelfid: req.body.pelfid }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    // return the information including token as JSON
    res.status(200).send({ auth: true, token: token, id: user._id });
  });

});



router.get('/accountbalance', VerifyToken, function(req, res) {
  User.findById({_id: req.userId}, function(err, balance) {
    if (err) return res.status(500).send('Error on the server.');
    if (!balance) return res.status(404).send('No user found.');

    res.status(200).send({ balance: balance.balance });
  })
});

router.get('/userprofile', VerifyToken, function(req, res) {
  User.findById({_id: req.userId}, function(err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    res.status(200).send({ firstname: user.firstname, lastname: user.lastname });
  })
});

router.post('/sendmoney', VerifyToken, function(req, res) {
  User.findById({ _id: req.userId }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    var amount = req.body.amount
    // check if PIN is valid
    var pinIsValid = bcrypt.compareSync(req.body.pin, user.pin);
    if (!pinIsValid) return res.status(401).send({ auth: false, token: null });

    User.findOne({ pelfid: req.body.pelfid }, function (err, reciepent) {
      if (err) return res.status(500).send('Error on the server.');
      if (!reciepent) return res.status(404).send('No reciepent found.');

      User.find({ pelfid: req.body.pelfid }, function (err, name) {
        if (err) return res.status(500).send('Error on the server.');
        if (!name) return res.status(404).send('No reciepent found.');

    // Check if user amount is larger than transaction amount
    if (user.balance < req.body.amount){
      res.json({ success: false, message: 'Insuffient Funds.' });
    } else {

    // Create History
    history.create({
      userid: req.userId,
      amount: req.body.amount,
      merchantid: req.body.pelfid,
      merchantname: req.body.pelfid,
      img_path: reciepent.img_path,
      description: req.body.description
    },
    function (err, history) {
      if (err) {return res.status(500).send("There was a problem registering the History Item`.");}
      else {
        var newBalance = user.balance - req.body.amount
        //var creditBalance = reciepent.balance + req.body.amount

        User.findByIdAndUpdate({_id: req.userId}, { $set: { balance: newBalance }}, {upsert: true, "new": false}, function (err, tank) {
    if (err) return handleError(err);

        var creditBalance = parseFloat(reciepent.balance) + parseFloat(req.body.amount)
        var query = {pelfid: req.body.pelfid}
        User.findOneAndUpdate({pelfid: req.body.pelfid}, {$set:{balance: creditBalance}}, { new: true, upsert: true }, function (err, thing2){
      if (err) console.log(err);
        });
});
  res.status(200).send(history);

    };
  });
  };
});
});
});
});

router.post('/verifypin', VerifyToken, function(req, res) {
  User.findById({ _id: req.userId }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    var amount = req.body.amount
    // check if PIN is valid
    var pinIsValid = bcrypt.compareSync(req.body.pin, user.pin);
    if (!pinIsValid) return res.status(401).send({ auth: false, token: null });

    // Check if user amount is larger than transaction amount
    if (user.balance < req.body.amount){
      res.json({ success: false, message: 'Insuffient Funds.' });
    } else {

    Merchant.findById({_id: req.body.merchantid}, function(err, merchant) {
      if (err) return res.status(500).send('Error on the server.');
      if (!merchant) return res.status(404).send('No user found.');

    // Create History
    history.create({
      userid: req.userId,
      amount: req.body.amount,
      merchantid: req.body.merchantid,
      merchantname: req.body.merchantname,
      img_path: merchant.img_path,
      description: req.body.description
    },
    function (err, history) {
      if (err) {return res.status(500).send("There was a problem registering the History Item`.");}
      else {
        var newBalance = parseFloat(user.balance) - parseFloat(req.body.amount)

        User.findByIdAndUpdate({_id: req.userId}, { $set: { balance: newBalance }}, { new: true }, function (err, tank) {
    if (err) return handleError(err);
  });
  Transaction.findOneAndUpdate({_id: req.body.transactId}, {$set:{status: 'completed'}}, { new: true, upsert: true }, function (err, thing2){
if (err) console.log(err);
  });
  res.status(200).send(history);
      }
    });
  });
}
});
});


router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function(req, res) {

  User.findOne({ pelfid:  req.body.pelfid }, function(err, user) {
      if (user) {
          return res.status(400).end('User already exists');
      } else {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var hashedPin = bcrypt.hashSync(req.body.pin, 8);

  User.create({
    firstname : req.body.firstname,
    lastname : req.body.lastname,
    phonenumber : req.body.phonenumber,
    pelfid : req.body.pelfid,
    pin : hashedPin,
    email : req.body.email,
    password : hashedPassword
  },
  function (err, user) {
    if (err) return res.status(500).send("There was a problem registering the user`.");

    // if user is registered without errors
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token, id: user._id });
  });
};
});

});

router.get('/verifytoken', VerifyToken, function(req, res) {
  res.status(200).send({ auth: true});
});

router.post('/changepassword', VerifyToken, function(req, res, next) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.findByIdAndUpdate({_id: req.userId}, { $set: { password: hashedPassword }}, { new: true }, function (err, tank) {
  if (err) return handleError(err);
    res.status(200).send("Password changed Succesfully");
  });

});

router.post('/changepin', VerifyToken, function(req, res, next) {

  var hashedPin = bcrypt.hashSync(req.body.pin, 8);

  User.findByIdAndUpdate({_id: req.userId}, { $set: { pin: hashedPin }}, { new: true }, function (err, tank) {
  if (err) return handleError(err);
    res.status(200).send("PIN changed Succesfully");
  });

});

router.get('/gethistory', VerifyToken, function(req, res, next) {

  User.findById({ _id: req.userId}, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    history.find({ userid: req.userId} || {pelfid: user.pelfid}, function (err, historyuser) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!historyuser) return res.status(404).send("No user found.");

      var data = [];
                //data.push({found:true});
                for(var i=0;i<historyuser.length;i++){
                    historyuser[i].img_path = fs.readFileSync(historyuser[i].img_path, 'base64');
                    data.push(historyuser[i]);
                }
                res.send(data);
      //res.status(200).send(historyuser);
    });
});
});

module.exports = router;
