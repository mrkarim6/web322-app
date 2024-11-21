/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Mohammad Reazaul Karim Student ID: 178417234 Date: 15 Nov 2024
*
*  Vercel Web App URL: web322-app-roan.vercel.app
* 
*  GitHub Repository URL: https://github.com/mrkarim6/web322-app.git
*
********************************************************************************/ 
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const storeService = require('./store-service');


cloudinary.config({
    cloud_name: 'dofgs98gt',
    api_key: '381269763699752',
    api_secret: 'Lahne34xDn7AZd1xYPBLqgONUfc',
    secure: true
});

const upload = multer(); 
app.use(express.static(path.join(__dirname, '../public')));

app.engine(".hbs", exphbs.engine({
     extname: ".hbs",    
    helpers: {
        navLink: function (url, options) {
            return '<li class="nav-item"><a ' +
                (url == app.locals.activeRoute ? 'class="nav-link active" ' : 'class="nav-link" ') +
                'href="' + url + '">' +
                options.fn(this) +
                '</a></li>';
        }
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    },
    safeHTML: function(context){
        return stripJs(context);
    }
    
    
}));

app.set('views',path.join(__dirname,'views'))
app.set("view engine", ".hbs");

// Menu Hi-Lighter
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Routers
app.get('/', (req, res) => {
    res.redirect("shop");
})


app.get('/about', (req, res) => {
    res.render("about");
})

app.get("/shop/:id", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
  
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        console.log(req.query.category);
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await storeService.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
  });



app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
  
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        console.log(req.query.category);
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await storeService.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
  });

app.get('/items', (req, res) => {

    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then(filteredItems => res.render("items", {items: filteredItems}))
            .catch(error => res.status(500).send("Error fetching items by category: " + error));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(filteredItems => res.render("items", {items: filteredItems}))
            .catch(error => res.status(500).send("Error fetching items by date: " + error));
    } else {
        storeService.getAllItems()
            .then(allItems => res.render("items", {items: allItems}))
         //   .then(allItems => res.json(allItems))
            .catch(error => res.status(500).send("Error fetching all items: " + error));
    }
})


app.get('/item/:value', async (req, res) => {
    try {
      const itemId = req.params.value;
      const item = await storeService.getItemById(itemId);
  
      if (item) {
        res.json(item); // Return the item as a JSON object
      } else {
        res.status(404).json({ message: 'Item not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching the item' });
    }
  })


app.get('/items/add', (req, res) => {
    res.render("addItem");
})

app.post('/items/add', upload.single('featureImage'), async (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });

    }else{
        processItem("");
    }   
    
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;

        const currentDate = new Date();
        req.body.itemDte = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

         const itemData = req.body;

        //console.log("I M HERE");

        storeService.addItem(itemData)
            .then(newItem => {
                res.redirect('/items');
            })
            .catch(error => {
                res.status(500).send("Error adding item: " + error);
            });
    }
})

 


app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then(categories => res.render("categories", {categories: categories}))
    .catch(err => {
        res.status(500).send(err);
    });
})
 
app.use((req, res) => {
    res.status(404).render("404");
});

//////////////

(async () => {
  try {
    await storeService.initialize();
    console.log('Data initialization successful!');
  } catch (err) {
    console.error('Failed to initialize data:', err);
  }
})();

module.exports = app;