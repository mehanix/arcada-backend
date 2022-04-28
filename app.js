require("dotenv/config");
const express = require("express")
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const app = express();
const populate = require('./populate');
const Category = require("./models/category");
const Furniture = require("./models/furniture");
app.use(bodyParser.json());

mongoose.connect(process.env.DB_CONNECTION_STRING_LOCAL, (req, res) => {
    console.log("connected")
    // populate.populateDb();

})

app.get("/", (req, res) => {
    res.send("First Request")
})

app.post("/add_category", async (req, res) => {
    try {
        const newCategory = new Category(req.body)
        await newCategory.save()
        res.send(newCategory)
    } catch(err) {
        res.send({message:err})
    }
})

app.get("/categories", async (req, res) => {
    
   Category.find({}).then((err, categories) => {
       if (err) {
           res.send({"err":err})
           return;
        }
        res.send(categories)
   })
})

app.get(`/category/:categoryId`, async (req, res) => {

    Furniture.find({"category":req.params.categoryId}).then((err, furniture) => {
        if (err) {
            res.send({"err":err})
            return;
         }
        res.send(furniture);
    })
})

app.get("/wall/window", async (req,res) => {
    Furniture.find({"name":"Window"}).then((err, furniture) => {
        if (err) {
            res.send({"err":err})
            return;
         }
        res.send(furniture);
    })
})

app.get("wall/door", async (req,res) => {
    Furniture.find({"name":"door"}).then((err, furniture) => {
        if (err) {
            res.send({"err":err})
            return;
         }
        res.send(furniture);
    })
})

app.get(`/furniture/:furnitureId`, async (req, res) => {

    Furniture.find({"_id":req.params.furnitureId}).then((err, furniture) => {
        if (err) {
            res.send({"err":err})
            return;
         }
        res.send(furniture);
    })
})

app.get("/2d/:filename", async (req, res) => {
    res.sendFile(__dirname + `/assets/2d/${req.params.filename}.svg`)
})

app.get("/3d/:filename", async (req, res) => {
    res.sendFile(__dirname + `/assets/3d/${req.params.filename}.fbx`)
})

app.listen(process.env.PORT, () => {
    console.log("Listening on 4133")
})
 
