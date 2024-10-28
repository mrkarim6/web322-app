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
    storeService.getAllItems().then(items => {
        res.json(items);
    }).catch(err => {
        res.status(500).send(err);
    });
})

app.get('/categories', (req, res) => {
    storeService.getCategories().then(categories => {
        res.json(categories);
    }).catch(err => {
        res.status(500).send(err);
    });
})
 
// Catch-all route for unmatched routes (404 Not Found)
app.use((req, res) => {
    res.status(404).send('<center style="font-size:5000%">404</center>');
});


module.exports = app;