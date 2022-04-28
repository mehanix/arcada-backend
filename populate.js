const Category = require("./models/category")
const Furniture = require("./models/furniture")

const mongoose = require("mongoose")
const fs = require('fs');

async function populateDb() {
    await Category.collection.drop();
    await Furniture.collection.drop();
    populateCategories();
    populateFurniture();
    console.log("Seed complete")

}

async function populateCategories() {
    let furniture = JSON.parse(fs.readFileSync("./seed_data/furniture.json"))
    let categories = JSON.parse(fs.readFileSync("./seed_data/categories.json"))
    console.log(furniture)
    for (let category of categories) {
        try {
            const newCategory = new Category({ "name": category.name, "visible": true })
            await newCategory.save()
            console.log(furniture[category.name])
            for (let fur of furniture[category.name]) {
                fur.category = newCategory._id;
                let newFurniture = new Furniture(fur)
                await newFurniture.save()
            }
        } catch (err) {
            console.log(err)
        }
    }
}

function populateFurniture() {

}
module.exports = { populateDb };