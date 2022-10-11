const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
          foodName:{type: String, required: true,},
          daysSinceIAte:{type: String, required: true,},
          articleImage:{type: String, required: true},
          likes:{type: Number, required: false},

});


const Food = mongoose.model("Food", FoodSchema);

module.exports = Food;