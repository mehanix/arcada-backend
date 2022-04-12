const express = require('express'),
  bodyParser = require("body-parser"),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
const fs = require('fs');
// var recursive = require("recursive-readdir");
const app = express();
const path = require('path');
var cors = require('cors')
app.use(cors())
console.log("Generating assets file...")

furnitureLibrary = {};
categories = {};
generateFurnitureLibrary();

// console.log(furnitureLibrary)

app.get('/', (req, res) => {
  res.send('Furniture Server is Up');
});

app.get('/categories', (req, res) => {
  res.send(categories)
})

app.get('/category/:id', (req, res) => {
    res.send(furnitureLibrary[req.params.id])
})

app.get('/:categoryId/:objectId', (req,res) => {
  res.sendFile(__dirname + `/assets/${req.params.categoryId}/${req.params.objectId}.svg`)
})

function generateFurnitureLibrary() {
  furnitureLibrary = {}
  categories = []
  let lib = {};
  dirs = fs.readdirSync("./assets/");
  dirs.forEach(dir => {
    furnitureLibrary[dir] = {}
    furnitureLibrary[dir]["objects"] = []
    files = fs.readdirSync("./assets/" + dir + '/');
    files.forEach((file) => {
      const extension = path.extname(file, )
      const filename = path.basename(file,  '.svg')
      console.log(filename,extension)
      if (extension == ".json") {
        categoryData = JSON.parse(fs.readFileSync(`./assets/${dir}/${file}`, { encoding: 'utf8', flag: 'r' }))
        categories.push(categoryData)
        furnitureLibrary[dir].id = categoryData.id
        furnitureLibrary[dir].name = categoryData.name
      }
      if (extension == ".svg") {
        const objName = filename.split('-')
        let len = objName.length
        let width = objName[len-1]
        let height = objName[len-2]
        objName.pop()
        objName.pop()
        console.log(objName)
        console.log(width,height)
        newObject = {
          id: filename,
          name: objName.join(' '),
          width:width,
          height:height
        }
        furnitureLibrary[dir].objects.push(newObject)
      }

    })
  })
}

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Arkada API Swagger",
      version: "0.1.0",
      description:
        "Swagger documentation for Arkada API",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Nicoleta Ciausu",
        url: "https://nicoleta.cc",
        email: "nicoleta.ciausu@outlook.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["./routes/books.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.listen(4133, () => {
  console.log(`Example app listening on port ${4133}`)
})

/**
 * /categories -> {
 *  {
 *    "id":"bedroom",
 *    "name":"Bedroom",
 *    "resPath":"/category/bedroom"
 *  }
 * }
 * 
 * /category/catName -> {
 *   {
 *     "title": "Sofa with 3 seats",
 *     "id": "Sofa_with_3_seats"
 *   }
 *   ...
 * }
 * 
 * /static/categoryId/objectId -> imaginea cu numele id.svg.
 */