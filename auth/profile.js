var express = require('express');
var app = express()
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var formidable = require('formidable');

var VerifyToken = require('./VerifyToken');
var User = require('../user/User');

router.use('/', express.static(path.join(global.__root, './uploads/')))
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, (__dirname, './uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

var upload = multer({ storage: storage })

router.get('/getphoto', VerifyToken, function (req, res) {
  User.findById({_id: req.userId}, function(err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    if (!user.img_path) res.send('No image');

    var userpath = user.img_path;
    fs.readFile((userpath), function (err, data) {
        if (err) {
            return console.log(err);
        }
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        console.log(data);
        res.end(data);
    });
});
});

router.post('/postphoto', VerifyToken, upload.single('image'), (req, res) => {
  User.findByIdAndUpdate({_id: req.userId}, { $set: { img_path: req.file.path }}, {upsert: true, "new": false}, function (err, tank) {
    if (err) return handleError(err);

    //here your other task.
    res.send(req.file.path);
    res.end();
});
});

module.exports = router;
