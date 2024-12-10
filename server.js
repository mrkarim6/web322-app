/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Mohammad Reazaul Karim Student ID: 178417234 Date: 4 Dec 2024
*
*  Vercel Web App URL: web322-app-roan.vercel.app
* 
*  GitHub Repository URL: https://github.com/mrkarim6/web322-app.git
*
********************************************************************************/ 
const express = require("express")
const fs = require("fs")
const path = require("path")
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const storeService = require("./store-service.js")
const exphbs = require('express-handlebars')
const stripJs = require('strip-js')
const clientSessions = require("client-sessions")
const authData = require("./auth-service")

const app = express()
const upload = multer()


cloudinary.config({
    cloud_name: 'dloru3mx1',
    api_key: '644113193457429',
    api_secret: '5bcw5DOCFHaNFhmILq00zggjg6Y',
    secure: true
})

app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        helpers: {
            navLink: function (url, options) {
                return (
                    '<li class="nav-item">' +
                    '<a' +
                    (url == app.locals.activeRoute ? ' class="nav-link active"' : ' class="nav-link"') +
                    ' href="' +
                    url +
                    '">' +
                    options.fn(this) +
                    "</a></li>"
                )
            },
            equals: function (lvalue, rvalue, options) {
                if (arguments.length < 3) throw new Error("Handlebars Helper 'equals' needs 2 parameters")
                return lvalue != rvalue ? options.inverse(this) : options.fn(this)
            },
            safeHTML: function (context) {
                return stripJs(context)
            },
            formatDate: function (dateObj) {
                let year = dateObj.getFullYear()
                let month = (dateObj.getMonth() + 1).toString()
                let day = dateObj.getDate().toString()
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`
            }
        },
    })
)

app.set('view engine', '.hbs')

app.use(function (req, res, next) {
    let route = req.path.substring(1)
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(
        /\/(.*)/, ""))
    app.locals.viewingCategory = req.query.category
    next()
})

app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({
    extended: true
}))

app.use(clientSessions({
    cookieName: 'session',
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr',
    duration: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    activeDuration: 30 * 60 * 1000 // 30 minutes
}))

app.use(function (req, res, next) {
    res.locals.session = req.session
    next()
})

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    next()
}

// Redirect root URL to /shop
app.get("/", (req, res) => {
    res.redirect("/shop")
})

// Route to serve about.html
app.get('/about', (req, res) => {
    res.render('about')
})

app.get("/shop", async (req, res) => {
    let viewData = {}
    try {
        viewData.items = req.query.category ?
            await storeService.getPublishedItemsByCategory(req.query.category) :
            await storeService.getPublishedItems()
        viewData.items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate))
        viewData.item = viewData.items[0] || null
    } catch {
        viewData.message = "no results"
    }

    try {
        viewData.categories = await storeService.getCategories()
    } catch {
        viewData.categoriesMessage = "no results"
    }

    res.render("shop", {
        data: viewData
    })
})

app.get("/shop/:id", async (req, res) => {
    let viewData = {}
    try {
        viewData.items = req.query.category ?
            await storeService.getPublishedItemsByCategory(req.query.category) :
            await storeService.getPublishedItems()
        viewData.items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate))
    } catch {
        viewData.message = "no results"
    }

    try {
        viewData.item = await storeService.getItemById(req.params.id)
    } catch {
        viewData.message = "no results"
    }

    try {
        viewData.categories = await storeService.getCategories()
    } catch {
        viewData.categoriesMessage = "no results"
    }

    res.render("shop", {
        data: viewData
    })
})

app.get("/items", (req, res) => {
    const category = req.query.category
    const minDate = req.query.minDate

    if (category) {
        storeService.getItemsByCategory(category)
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", {
                        items: data
                    })
                } else {
                    res.render("items", {
                        message: "no results"
                    })
                }
            })
            .catch((err) => {
                res.render("items", {
                    message: "no results"
                })
            })
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", {
                        items: data
                    })
                } else {
                    res.render("items", {
                        message: "no results"
                    })
                }
            })
            .catch((err) => {
                res.render("items", {
                    message: "no results"
                })
            })
    } else {
        storeService.getAllItems()
            .then((data) => {
                if (data.length > 0) {
                    res.render("items", {
                        items: data
                    })
                } else {
                    res.render("items", {
                        message: "no results"
                    })
                }
            })
            .catch((err) => {
                res.render("items", {
                    message: "no results"
                })
            })
    }
})

app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", {
                    categories: data
                })
            } else {
                res.render("categories", {
                    message: "no results"
                })
            }
        })
        .catch((err) => {
            res.render("categories", {
                message: "no results"
            })
        })
})

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
    const processItem = async (imageUrl) => {
        req.body.featureImage = imageUrl
        try {
            await storeService.addItem(req.body)
            res.redirect("/items")
        } catch (err) {
            console.error("Error adding item:", err)
            res.status(500).send("Failed to add item")
        }
    }

    if (req.file) {
        try {
            const uploaded = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result)
                    else reject(error)
                })
                streamifier.createReadStream(req.file.buffer).pipe(stream)
            })
            await processItem(uploaded.url)
        } catch (err) {
            console.error("Upload error:", err)
            res.status(500).send("Failed to upload image")
        }
    } else {
        await processItem("")
    }

})

app.get("/items/add", async (req, res) => {
    try {
        const categories = await storeService.getCategories()
        res.render("addItem", {
            categories: categories || []
        })
    } catch (err) {
        console.error("Error fetching categories:", err)
        res.render("addItem", {
            categories: []
        })
    }
})

app.get("/item/:id", (req, res) => {
    const itemId = req.params.id

    storeService.getItemById(itemId)
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            send404Page(res)
        })
})


app.get("/categories/add", (req, res) => res.render("addCategory"))

app.post("/categories/add", async (req, res) => {
    try {
        await storeService.addCategory(req.body)
        res.redirect("/categories")
    } catch (err) {
        console.error("Error adding category:", err)
        res.status(500).send("Failed to add category")
    }
})

app.get("/categories/delete/:id", async (req, res) => {
    try {
        await storeService.deleteCategoryById(req.params.id)
        res.redirect("/categories")
    } catch (err) {
        console.error("Error deleting category:", err)
        res.status(500).send("Unable to remove category / Category not found")
    }
})

app.get("/items/delete/:id", async (req, res) => {
    try {
        await storeService.deleteItemById(req.params.id)
        res.redirect("/items")
    } catch (err) {
        console.error("Error deleting item:", err)
        res.status(500).send("Unable to remove item / Item not found")
    }
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", (req, res) => {
    authData.registerUser(req.body)
        .then(() => {
            res.render("register", {
                successMessage: "User created"
            })
        })
        .catch((err) => {
            res.render("register", {
                errorMessage: err,
                userName: req.body.userName
            })
        })
})

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent')
    authData.CheckUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            }
            res.redirect('/items')
        })
        .catch((err) => {
            res.render("login", {
                errorMessage: err,
                userName: req.body.userName
            })
        })
})

app.get("/logout", (req, res) => {
    req.session.reset()
    res.redirect('/')
})

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory")
})

function send404Page(res) {
    res.status(404).render("404")
}

app.use((req, res) => {
    send404Page(res)
})


authData.initialize()
    .then(() => {
        console.log("Auth service initialized successfully.")
        return storeService.initialize()
    })
    .then(() => {
        console.log("Store service initialized successfully.")
    })
    .catch((err) => {
        console.error("Initialization error:", err)
    })


module.exports = app