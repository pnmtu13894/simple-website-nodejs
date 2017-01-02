const express = require('express');
const hbs = require('hbs');
const path = require('path');
const {ObjectID} = require('mongodb');
const bodyParser = require('body-parser');
const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;

var {mongoose} = require('./mongodb/mongodb-connect');
var {Book} = require('./models/books');
var {User} = require('./models/user');
var multer = require('multer');
var app = express();
var port = process.env.PORT || 3000;
var crypto = require('crypto');
var fs = require('fs');
var favicon = require('serve-favicon');

app.use(favicon(__dirname + './../public/favicon.ico'));

hbs.registerPartials(path.join(__dirname, '../views/partials'));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + './../public'));

app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);
  fs.appendFile('server.log', log + '\n');
  next();
});

// Define a destination for uploaded image
var storage = multer.diskStorage({
  destination: 'public/img/',
  // Decrypt the image to be seeable
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
});

// Define a storage of the image path
var upload = multer({storage: storage});

app.get('/', (req, res) => {
  res.render('homepage.hbs', {
    pageTitle: "Home Page",
    currentYear: new Date().getFullYear()
  });
});

// Define a helper function by handlebars
hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

// Define a helper function by handlebars
hbs.registerHelper('makeUppercase', (message) =>{
  return message.toUpperCase();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/createBook', (req, res) => {
   Book.find().sort({_id: -1}).then((books) => {
    res.render('createBook.hbs', {
      cBooks: books,
      pageTitle: 'Create New Book'
    });
  }, (e) => {
    console.log('Unable to fetch data');
  });
});

app.post('/createBook', upload.single('image'), (req, res) => {
  console.log(req.file);
  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    type: req.body.type,
    price: req.body.price,
    image: req.file.filename
    });

  book.save().then((cbook) => {
    console.log('Saved book');
    res.redirect('/createBook');
  }, (e) => {
    console.log('Unable to save', e);
  });


});


app.get('/test', (req, res) => {
  Book.find().then((books) => {
    res.render('test.hbs', {
      cBooks: books,
      pageTitle: 'Test page',
    });
  });
});

app.get('/about', (req, res) => {
  res.send('About page');
});

app.post('/book/delete', (req, res) => {
  // get the id
  var id = req.body.id;
  //validate the id
  console.log(id);
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  //remove by id
  Book.findByIdAndRemove(id).then((book) => {
    imagePath = path.join(path.join(path.join(__dirname, 'public'), 'img'), book.image);
    console.log(imagePath);
    if(!book){
      return res.status(404).send();
    }
    fs.exists(path.join('public/img', book.image), (image) => {
      if(image){
        console.log('File exists');
      } else{
        console.log('File is not found');
      }
    })
    fs.unlink(path.join('public/img', book.image), (err) => {
      if(err){
        console.log('Unable to delete image')
      }
    });
    res.redirect('/createBook');
  }).catch((e) => {
    console.log('Unable to delete item');
    res.status(404).send();
  });
});

app.get('/Book/update/:id', (req, res) => {
  var id = req.params.id;

  console.log(id);

  if(!ObjectID.isValid(id)){
    res.status(404).send();
  }

  Book.findById({
    _id: new ObjectID(id)
  }).then((cBook) => {
    res.render('updateBook.hbs', {
      currentBook: cBook,
      pageTitle: 'Update book'
    });
  }, (e) => {
    console.log('Unable to fetch data');
  });
});

app.post('/Book/update', (req, res) => {
  var id = req.body.id;
  if(!ObjectID.isValid(id)){
    res.status(404).send();
  }

  Book.findByIdAndUpdate(id,{
    _id: id,
    title: req.body.title,
    author: req.body.author,
    type: req.body.type,
    time: new Date(),
    price: req.body.price
  }).then((cbook) => {
    res.redirect('/createBook');
  }, (e) => {
    console.log('Unable to fetch data');
  });
});

app.listen(port, () => {
  console.log(`The server is on port ${port}`);
});
