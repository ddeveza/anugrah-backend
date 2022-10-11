require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
// import upload from '../client/public/uploads'

// we use multer to upload images
const multer = require('multer');
// this is storage settings

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, '../client/public/uploads');
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
const { request } = require('express');
// db settings
mongoose.connect(
  'mongodb+srv://masiha:Xb7kuTSwuDgUdMGM@cluster0.o73j306.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
  }
);
console.log('conected to db..');

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
  const food = new FoodModel({
    foodName: foodName,
    daysSinceIAte: days,
    articleImage: fileName,
  }); // here values are same as in frontend

  try {
    await food.save();
    console.log('Data inserted..');
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

  try {
    await FoodModel.findById(id, (err, updateFood) => {
      updateFood.foodName = foodName;
      updateFood.daysSinceIAte = days;
      updateFood.articleImage = fileName;
      updateFood.save();
      res.send('updated...');
    });
  } catch (error) {
    console.log(error);
  }
});

// this is for uploading images

// crud ends here

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
