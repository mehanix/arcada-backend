require("dotenv/config");
const express = require("express")
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const app = express();
const populate = require('./populate');
const Category = require("./models/category");
const Furniture = require("./models/furniture");
const User = require("./models/user");
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors')
const multer = require('multer');
const upload = multer({dest:'./uploads/'});
var fs = require('fs');
app.use(bodyParser.json());
app.use(cors())
//form data
app.use(express.static('public'));
mongoose.connect(process.env.DB_CONNECTION_STRING_LOCAL, (req, res) => {
    console.log("connected")
    populate.populateDb();

})

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1]

    console.log(token)
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log("hi", err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

// login using admin credentials
app.post("/adminLogin", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (validPassword) {
            const token = generateAccessToken({ username: req.body.username});
            res.status(200).json(token);
        } else {
          res.status(400).json({ error: "Invalid Password" });
        }
      } else {
        res.status(401).json({ error: "User does not exist" });
      }
 

})

app.post("/populate", authenticateToken, async (req, res) => {
    populate.populateDb();
    res.send("reseeded DB")
})

// add new admin-type account to system
app.post("/addUser", authenticateToken, async (req,res) => {

    if (!(req.body.username && req.body.password)) {
        return res.status(400).send({ error: "mising username or password field" });
      }
        const user = new User(req.body);
      // generate salt to hash password
      const salt = await bcrypt.genSalt(10);
      // now we set user password to hashed password
      user.password = await bcrypt.hash(user.password, salt);
      user.save().then((status) => res.status(201).send(status));
})

// upload image
app.post("/uploadImage", upload.single('file'), authenticateToken, async (req,res) => {

    console.log(req.file);
    if (req.file.originalname.split('.')[1] !== "svg") {
        res.send("files must be svg")
    }

    var src = fs.createReadStream(req.file.path);
    var dest = fs.createWriteStream('./assets/2d/' + req.file.originalname);
    src.pipe(dest);
    src.on('end', function() { res.render('complete'); });
    src.on('error', function(err) { res.render('error'); });
    res.send("done")
    
})

app.post("/category", authenticateToken, async (req, res) => {
    try {
        const newCategory = new Category(req.body)
        await newCategory.save()
        res.send(newCategory)
    } catch (err) {
        res.send({ message: err })
    }
})

app.post("/category/add", authenticateToken, async (req, res) => {
    try {
        const newFurniture = new Furniture(req.body)
        await newFurniture.save()
        res.send(newFurniture)
    } catch (err) {
        res.send({ message: err })
    }
})

// edit category
app.put("/category", authenticateToken, async (req, res) => {
    try {
        Category.find({ "_id": req.body.id }).then((categories, err) => {
            if (err) {
                res.send({ "err": err })
                return;
            }
            if (categories.length == 0) {
                res.send({ "err": "could not find category with given id" })
            }
            let category = categories[0]
            if (req.body.name) {
                category.name = req.body.name
            }
            if (req.body.visible != undefined) {
                category.visible = req.body.visible
            }
            category.save()
            res.send(category)
        })

    } catch (err) {
        res.send({ message: err })
    }
})

// delete furniture 
app.delete(`/furniture/:furnitureId`, authenticateToken, async (req, res) => {
    Furniture.findOneAndDelete({ "_id": req.params.furnitureId })
        .then((err) => {
            if (err) {
                res.send(err)
            }
            else {
                res.send("succesfully deleted")
            }
        })

})

// delete category
app.delete(`/category/:categoryId`, authenticateToken, async (req, res) => {
    Furniture.deleteMany({ "category": req.params.categoryId }).then((status) => {
        Category.findOneAndDelete({ "_id": req.params.categoryId })
            .then((answer) => {
                if (answer) {
                    res.send(answer)

                }
            }).then(ans => {
                res.send("Could not delete")
            })
    })

})

// edit furniture
app.put("/furniture", authenticateToken, async (req, res) => {
    try {
        Furniture.find({ "_id": req.body.id }).then((fur, err) => {
            if (err) {
                res.send({ "err": err })
                return;
            }
            if (fur.length == 0) {
                res.send({ "err": "could not find category with given id" })
                return;
            }
            let furniture = fur[0]
            if (req.body.name) {
                if (typeof req.body.name != "string") {
                    res.send({ "err": "wrong type for parameter name" })
                    return;
                }
                furniture.name = req.body.name
            }
            if (req.body.width != undefined) {
                if (typeof req.body.width != "number") {
                    res.send({ "err": "wrong type for parameter width" })
                    return;
                }
                furniture.width = req.body.width
            }
            if (req.body.height != undefined) {
                if (typeof req.body.height != "number") {
                    res.send({ "err": "wrong type for parameter height" })
                    return;
                }
                furniture.height = req.body.height
            }
            if (req.body.imagePath != undefined) {
                if (typeof req.body.imagePath != "string") {
                    res.send({ "err": "wrong type for parameter imagePath" })
                    return;
                }
                furniture.imagePath = req.body.imagePath
            }
            if (req.body.category != undefined) {
                if (typeof req.body.category != "string") {
                    res.send({ "err": "wrong type for parameter category" })
                    return;
                }
                console.log("a", req.body.category)
                Category.find({ "_id": req.body.category }).then((categories, err) => {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    if (res.length == 0) {
                        res.send({ "err": "category does not exist" })
                        return;
                    }
                    furniture.category = req.body.category
                    furniture.save()
                    res.send(furniture)
                    return;
                })
            } else {
                furniture.save()
                res.send(furniture)
                return;
            }

        })

    } catch (err) {
        res.send({ message: err })
    }
})

app.get("/categories", async (req, res) => {

    Category.find({}).then((categories, err) => {
        if (err) {
            res.send({ "err": err })
            return;
        }
        res.send(categories)
    })
})

app.get(`/category/:categoryId`, async (req, res) => {

    Furniture.find({ "category": req.params.categoryId }).then((furniture, err) => {
        if (err) {
            res.send({ "err": err })
            return;
        }
        res.send(furniture);
    })
})

app.get("/wall/window", async (req, res) => {
    Furniture.find({ "name": "Window" }).then((furniture, err) => {
        if (err) {
            res.send({ "err": err })
            return;
        }
        res.send(furniture);
    })
})

app.get("/wall/door", async (req, res) => {
    Furniture.find({ "name": "Door" }).then((furniture, err) => {
        if (err) {
            res.send({ "err": err })
            return;
        }
        res.send(furniture);
    })
})

app.get(`/furniture/:furnitureId`, async (req, res) => {

    Furniture.find({ "_id": req.params.furnitureId }).then((furniture, err) => {
        if (err) {
            res.send({ "err": err })
            return;
        }
        res.send(furniture);
    })
})

app.get("/2d/:filename", async (req, res) => {
    res.sendFile(__dirname + `/assets/2d/${req.params.filename}.svg`)
})

app.get("/3d/:filename", async (req, res) => {
    res.sendFile(__dirname + `/assets/3d/${req.params.filename}`)
})

app.listen(process.env.PORT, () => {
    console.log("Listening on 4133")
})

