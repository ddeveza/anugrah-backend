require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const sharp = require("sharp");
const fs = require('fs')
// import upload from '../client/public/uploads'

// we use multer to upload images
const multer = require('multer');
// this is storage settings

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// from here i am adding CRUD

// import db file
const FoodModel = require('./models/Food');
const mongoose = require('mongoose');

// db settings
mongoose.connect(
  process.env.DB,
  {
    useNewUrlParser: true,
  }
);



app.patch('/insert', async (req, res) => {
  const likes = req.body.likes;
  const id = req.body.id;

  try {
    await FoodModel.findOneAndUpdate(
      { _id: id },
      { $set: { likes: likes } },
      { upsert: true }
    );

    res.send('updated');
    console.log('like inserted..');
  } catch (error) {
    console.log(error);
  }
});

// backend funtion to insert data
app.post('/insert', upload.single('articleImage'), async (req, res) => {
  const foodName = req.body.foodName;
  const days = req.body.days;
  const fileName = req.file.originalname;

  const image = fs.readFileSync("uploads/" + fileName);
  /*   const base64String = btoa(
      String.fromCharCode(
        ...new Uint8Array(image)
      )
    ); */


  const lowQuality = await sharp(image)
    .webp({ quality: 30 }).toBuffer()

  const base64String = btoa(new Uint8Array(lowQuality).reduce(function(data, byte) {
    return data + String.fromCharCode(byte);
  }, ''));

  const food = new FoodModel({
    foodName: foodName,
    daysSinceIAte: days,
    articleImage: {
      data: base64String,
      contentType: "image/png"
    },
  }); // here values are same as in frontend

  try {
    const response = await food.save();
    res.send(response)
  } catch (err) {
    console.log(err);
  }
});

// read data

app.get('/read', async (req, res) => {
  FoodModel.find({}, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.send(result);
  });
});

// to delete items

app.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;
  await FoodModel.deleteOne({ _id: id });
  res.send('deleted sucessfully....');
});

// this is for update

app.put('/update', upload.single('articleImage'), async (req, res) => {
  const foodName = req.body.foodName;
  const id = req.body.id;
  const days = req.body.days;
  // const fileName = req.file.originalname
  const fileName = req.file.originalname;
  const image = fs.readFileSync("uploads/" + fileName);
  /*   const base64String = btoa(
      String.fromCharCode(
        ...new Uint8Array(image)
      )
    ); */


  const lowQuality = await sharp(image)
    .webp({ quality: 30 }).toBuffer()

  const base64String = btoa(new Uint8Array(lowQuality).reduce(function(data, byte) {
    return data + String.fromCharCode(byte);
  }, ''));


  // const base64String = Buffer.from(lowQuality, 'base64').toString()
  try {
    await FoodModel.findById(id, async (err, updateFood) => {
      updateFood.foodName = foodName;
      updateFood.daysSinceIAte = days;
      updateFood.articleImage = {
        data: base64String,
        contentType: "image/png"
      };
      const response = await updateFood.save();

      res.send(response);
    });
  } catch (error) {
    console.log(error);
  }
});

// this is for uploading images

// crud ends here

const port = process.env.PORT || 8000;
app.listen(port, console.log(`Listening on port ${port}...`));
