var express = require('express');
var router = express.Router();
const User = require('../models/user');
const validatePassword = require('../utils&middleware/validatePassword');
const auth = require('../utils&middleware/auth');
const App = require('../models/app');
const upload = require('../utils&middleware/upload')
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { GridFSBucket } = require('mongodb');
const redirectUrl = require('../utils&middleware/redirectUrl')

/* Connection to MongoDB files for fetching files */
const conn = mongoose.connection;
let gfs; // for screenshots
let apks;  // for apk files
conn.once('open', () => {
  console.log('GridFS initialised!')
  gfs = Grid(conn.db, mongoose.mongo)
  gfs.collection('screenshots')
  apks = Grid(conn.db, mongoose.mongo)
  apks.collection('apks')
})

/* fetching screenshots from MongoDB */
router.get('/image/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(id)})
    // console.log('file: ', file)
    if (!file || file.length === 0) {
      return console.log('no file exists')
    }

    if (file.contentType.startsWith('image/')) {
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'screenshots'
      })

      const readstream = bucket.openDownloadStream(file._id)
      // console.log('READ STREAM: ', readstream)
      readstream.pipe(res)
    } else {
      return console.log('Not an image')
    }
  } catch (err) {
    return console.error('Internally code problemss:',err);
  }

});

/* Defult set to title */
const title = 'Mobile App Store';

/* GET home page. */
router.get('/', async function(req, res, next) {
  const user = await User.findById(req.session.userId);
  const apps = await App.find({});
  const appsWithScreenshots = await Promise.all(apps.map(async app => {

    if(app.screenshot.length === 0){
      return {
        ...app._doc
      }
    } else {
      const screenshot = app.screenshot[0]
      console.log('app.screenshot.length:', app.screenshot.length)
      const screenshotUrl = `/image/${screenshot}`

      return {
        ...app._doc,
        screenshotUrl
      }
    }
    
  }))

  res.render('home', { title, user: user, apps: appsWithScreenshots})
});

/* GET login page */
router.get('/login', (req, res) => { 
  if(req.session.userId) {
    return res.redirect('/')
  }
  res.render('login', { title });
})

/* POST login */
router.post('/login', async function(req, res) {

  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(user && validatePassword(password, user.password)){
    req.session.userId = user._id;
    
    const redirectUrl = req.session.redirect || '/';
    delete req.session.redirect
    res.redirect(redirectUrl);
  } else {
    res.render('login', { error: 'Email or Password are incorrect'});
  }
  
})

/* POST logout */
router.post('/logout', auth, (req, res) => {
  console.log('Logout route accessed');
  req.session = null;
  res.redirect('/');
});

/* GET newApp page */
router.get('/new', auth, async function(req, res) {
  const user = await User.findById(req.session.userId);
  res.render('newApp', { title: 'Create a new app', user: user});
})

/* POST new for new app uploads */
router.post('/new', auth, upload.fields([
  { name: 'apk', maxCount: 1},
  { name: 'screenshot'}
]), async function(req, res) {
  try{
    const {name, description, details} = req.body;
    

    const apkFile = req.files['apk'] ? req.files['apk'][0] : null;
    const screenshotFiles = req.files['screenshot'] || [];

    if(!apkFile){
       return console.error('APK file upload failed')
    }else if(!apkFile.id) {
      return console.error('missing _id')
    }

    const app = new App({
      name: name,
      description: description,
      details: details,
      apk: apkFile ? apkFile.id : null,
      screenshot: screenshotFiles.map(file => file.id),
      creator: req.session.userId
    });
    // console.log('new App: ' ,app)

    await app.save()
    .then(result => {
      console.log('newApp created!:', result);
    });
    
    //finding the id of the new app
    const newApp = await App.findOne({name})
    const newAppId = newApp._id
    // console.log('newAppId:', newAppId)
    res.redirect(`/app/${newAppId}`);
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).send('An error occurred while uploading the files.');
  }
})

/* fetching an apk file from MongoDB  */
router.get('/download/apk/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const file = await apks.files.findOne({ _id: new mongoose.Types.ObjectId(id)})
    console.log('file: ', file)
    if (!file || file.length === 0) {
      return console.log('no apk exists')
    }

    if (file.contentType === 'application/vnd.android.package-archive' 
      || file.contentType === 'application/octet-stream') {
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'apks'
      })

      const readstream = bucket.openDownloadStream(file._id)
      console.log('READ STREAM: ', readstream)
      readstream.pipe(res)
    } else {
      return console.log('Not an apk')
    }
  } catch (err) {
    return console.error('Internally code problem:',err);
  }

})

/* GET app/:id for each app's details */
router.get('/app/:id', redirectUrl, async function(req, res, next) {
  try{
    const user = await User.findById(req.session.userId);
    const id = req.params.id;

    if(user) {
      delete req.session.redirect
    }

    const app = await App.findById(id);
    if(!app) {
      return res.render('home')
    }

    const screenshotUrls = app.screenshot.map(screenshotId => {
    const url = `/image/${screenshotId}`
      return url
    })

    res.render('appDetail', { title, user: user, app: app, screenshotUrls: screenshotUrls})
  } catch (error) {
    return console.log('error fetching app details', error)
  }
  
});

/* GET myApps page */
router.get('/my', auth, async (req, res) => {

  try {
    const userId = req.session.userId;
    const user = await User.findById(req.session.userId);
    const myApps = await App.find({ creator: userId})
    // console.log('myApps: ', myApps)
    

    res.render('myApps', {title : 'My Apps', myApps: myApps, user: user})

  } catch (error) {
    return console.log('Internal server error:', error)
  }

})

/* POST to delete an app with an id */
router.post('/app/delete/:id', auth, async (req, res, next) => {

  try {

    const userId = req.session.userId
    const appId = req.params.id
    const app = await App.findById(appId)

    if (!app || app.creator.toString() !== userId.toString()) {
      return console.log('app not exists or creator doesnt match')
    }

    const bucketApks = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'apks'
    })

    const bucketScreenshots = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'screenshots'
    })

    if(app.apk) {
      bucketApks.delete(new mongoose.Types.ObjectId(app.apk), (err) => {
        if (err) {
          return console.error('Error deleting APK:', err)
        }
      })
    }

    for (let screenshotId of app.screenshot) {
      bucketScreenshots.delete(new mongoose.Types.ObjectId(screenshotId), (err) => {
        if (err) {
          return console.error('Error deleting screenshots:', err)
        }
      })
    }

    await App.findByIdAndDelete(appId)
    .then(result => console.log('All data deleted successfully!'))
    res.redirect('/my')

  } catch (error) {
    return console.log('internal error: ', error)
  }

})

/* GET register page */
router.get('/register', (req, res) => {
  if(req.session.userId){
    return res.redirect('/')
  }
  res.render('register', { title })
})

/* POST for a new account */
router.post('/register', async function(req, res) {
  const {email, password} = req.body;
  console.log('email: ', email, 'password: ', password);

  // if same email exists
  const isUser = await User.findOne({email});
  if(isUser) {
    return res.render('register', { error: 'Email already exists', title})
  }

  const user = new User({
    email: email,
    password: password
  });

  // console.log('new user: ', user);

  await user.save().then(result => {
    console.log('new account made:', result);
  })
  .catch (error => {
    console.log('fail');
  })
  res.redirect('/login');
})

module.exports = router;