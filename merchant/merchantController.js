var express = require('express');
var app = express()
var router = express.Router();
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

var VerifyToken = require('../auth/VerifyToken');

router.use('/', express.static(path.join(global.__root, './posts/')))
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var Merchant = require('../merchant/Merchant');
var history = require('../user/History');
var Transaction = require('../merchant/Transaction');
var Post = require('../merchant/Post');
var User = require('../user/User');

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, (__dirname, './posts/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
var upload = multer({ storage: storage })

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file


router.post('/login', function(req, res) {

  Merchant.findOne({ email: req.body.email }, function (err, merchant) {
    if (err) return res.status(500).send('Error on the server.');
    if (!merchant) return res.status(404).send('No user found.');

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, merchant.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: merchant._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    // return the information including token as JSON
    res.status(200).send({ auth: true, token: token, id: merchant._id });
  });
});



router.post('/register', function(req, res) {

  Merchant.findOne({ pelfid:  req.body.pelfid }, function(err, merchant) {
      if (merchant) {
          return res.status(400).end('User already exists');
      } else {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  Merchant.create({
    merchantname: req.body.merchantname,
    contactname: req.body.contactname,
    phonenumber: req.body.phonenumber,
    workaddress: req.body.workaddress,
    worknumber: req.body.worknumber,
    cacnumber: req.body.cacnumber,
    industrytype: req.body.industrytype,
    pelfid: req.body.pelf,
    //img_path: req.file.path,
    email: req.body.email,
    password: hashedPassword
  },
  function (err, merchant) {
    if (err) return res.status(500).send("There was a problem registering the merchant`.");

    // if user is registered without errors
    // create a token
    var token = jwt.sign({ id: merchant._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token, id: merchant._id });
  });
};
});

});

router.post('/createtransaction', VerifyToken, function(req, res) {
  Merchant.findById({_id: req.userId}, function(err, merchant) {
    if (err) return res.status(500).send('Error on the server.');
    if (!merchant) return res.status(404).send('No user found.');

    //var merchantName = merchant.merchant


    Transaction.create({
      merchantname: merchant.merchantname,
      merchantid: req.userId,
      amount: req.body.amount,
      redirecturl: req.body.redirecturl,
      description: req.body.description
    },
    function (err, transaction) {
      if (err) return res.status(500).send("There was a problem creating the transaction`.");

      res.status(200).send({id: transaction._id});
      var i = 10
      for(key in i)  {
        (function(i) {
          Transaction.findById({_id: transaction._id}, function(err, transaction) {
            if (err)  return res.status(500).send('Error on the server.');
            if (!transaction) return res.status(404).send('No transaction found.');

            if (transaction.status = ['completed']) {
              return res.redirect(req.body.redirecturl);
            }
          });
        })(i);
      }
    });
  });
});

router.get('/gettransaction', VerifyToken, function(req, res) {
  User.findById({_id: req.userId}, function(err, merchant) {
    if (err) return res.status(500).send('Error on the server.');
    if (!merchant) return res.status(404).send('No user found.');

  var id = req.headers['id']
  Transaction.findById({_id: id}, function(err, transaction) {
    if (err) return res.status(500).send('error on the server');
    if (!transaction) return res.status(404).send('No transaction found.');

    Merchant.findOne({merchantname: transaction.merchantname}, function(err, merchant) {
      if (err) return res.status(500).send('Error on the Server');
      if (!merchant) return res.status(404).send('No merchant found');
      merchant.img_path = fs.readFileSync(merchant.img_path, 'base64');

  res.send({merchantid: transaction.merchantid,
     merchantname: transaction.merchantname,
     amount: transaction.amount,
     description: transaction.description,
     status: transaction.status,
     imgPath: merchant.img_path,
     });
   });
  });
});
});

router.post('/createpost', VerifyToken, upload.single('postimage'), function(req, res) {
  Merchant.findById({_id: req.userId}, function(err, merchant) {
    if (err) return res.status(500).send('Error on the server.');
    if (!merchant) return res.status(404).send('No user found.');

    Post.create({
      merchantname: merchant.merchantname,
      merchantid: req.userId,
      merchantImgPath: merchant.img_path,
      postCaption: req.body.postCaption,
      postImgPath: req.file.path,
      postType: req.body.postType,
    },
    function (err, transaction) {
      if (err) return res.status(500).send("There was a problem creating the post`.");

      res.status(200).send('Post created.');
    });
  });
});

router.get('/user/getposts', function(req, res) {
    Post.find({}, function(err, posts){
      if (err) return res.status(500).send('Error on the server.');
      if (!posts) return res.status(404).send('No post found.');
      if (!posts.merchantImgPath)  console.log('No merchant image');

      var postImage = (posts.postImgPath);
      var merchantImage = (posts.merchantImgPath);
      var data = [];
                //data.push({found:true});
                for(var i=0;i<posts.length;i++){
                    posts[i].postImgPath = fs.readFileSync(posts[i].postImgPath, 'base64');
                    posts[i].merchantImgPath = fs.readFileSync(posts[i].merchantImgPath, 'base64');
                    data.push(posts[i]);
                }
                res.send(data);
    });
  });


module.exports = router;
