const mongoose = require('mongoose');
require('dotenv').config();

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    mongoose.connect(process.env.DB, connectionParams)
    console.log('connected to databse sucessfully...');

  } catch (error) {
    console.log(error);
    console.log('could not connect to database');

  }
}