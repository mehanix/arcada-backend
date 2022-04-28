const mongoose = require("mongoose");
const Category = require("./category");

const Furniture = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: Category }
})

module.exports = mongoose.model("furniture", Furniture);