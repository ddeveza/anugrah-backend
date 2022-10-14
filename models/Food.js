const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  foodName: { type: String, required: true, },
  daysSinceIAte: { type: String, required: true, },
  articleImage: {
    data: String,
    contentType: String,
  },
  likes: { type: Number, required: false },

});


const Food = mongoose.model("Food", FoodSchema);

module.exports = Food;