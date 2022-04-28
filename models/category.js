const mongoose = require("mongoose")

const Category = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    visible: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model("Category", Category);