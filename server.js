/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Mohammad Reazaul Karim
Student ID: 178417234
Date: 12 Oct 2024
Vercel Web App URL: web322-app-roan.vercel.app
GitHub Repository URL: https://github.com/mrkarim6/web322-app.git

********************************************************************************/ 

const express = require('express')
const app = express()
const path = require('path')
//const port = 8080

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
    cloud_name: 'dofgs98gt',
    api_key: '381269763699752',
    api_secret: 'Lahne34xDn7AZd1xYPBLqgONUfc',
    secure: true
});

const upload = multer(); 

app.use(express.static('public')); 

const storeService = require('./store-service.js');

//////////////

storeService.initialize().then(() => {
    console.log('Data initialization successful!');
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to initialize data:', err);
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"))
})


app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"))
})


app.get('/shop', (req, res) => {
    storeService.getPublishedItems().then(items => {
        res.json(items);
    }).catch(err => {
        res.status(500).send(err);
    });
})

app.get('/items', (req, res) => {

    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then(filteredItems => res.json(filteredItems))
            .catch(error => res.status(500).send("Error fetching items by category: " + error));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(filteredItems => res.json(filteredItems))
            .catch(error => res.status(500).send("Error fetching items by date: " + error));
    } else {
        storeService.getAllItems()
            .then(allItems => res.json(allItems))
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
    res.sendFile(path.join(__dirname,"/views/addItem.html"))
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

        const itemData = req.body;

        console.log("I M HERE");

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
    storeService.getCategories().then(categories => {
        res.json(categories);
    }).catch(err => {
        res.status(500).send(err);
    });
})
 
app.use((req, res) => {
    res.status(404).send('<center style="font-size:5000%">404</center>');
});


module.exports = app;