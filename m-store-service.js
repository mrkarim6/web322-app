require('pg');
const Sequelize = require('sequelize')

// Initialize Sequelize with Neon.tech credentials
const sequelize = new Sequelize('web322', 'web322_owner', 'XVpqYd95LOvQ', {
    host: 'ep-bold-mountain-a5kgp46k.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
})


/*
const sequelize = new Sequelize('web322', 'web322_owner', 'XVpqYd95LOvQ', {
    host: 'ep-bold-mountain-a5kgp46k.us-east-2.aws.neon.tech', // Replace 'host' with your actual host
    dialect: 'postgres',
    port: 5432, // Default PostgreSQL port
    dialectOptions: {
        ssl: { rejectUnauthorized: false } // For secure SSL connections
    },
    query: { raw: true } // Return raw query results
});
*/

// Define the Item model
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE,
})

// Define the Category model
const Category = sequelize.define('Category', {
    category: Sequelize.STRING,
})

// Define the relationship between Item and Category
Item.belongsTo(Category, { foreignKey: 'category' })

// Initialize the database
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                console.log("Database & tables created!")
                resolve()
            })
            .catch((err) => {
                reject("Unable to sync the database: " + err)
            })
    })
}

// Get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then((data) => {
                if (data.length > 0) {
                    resolve(data)
                } else {
                    reject("No results returned")
                }
            })
            .catch(() => {
                reject("Unable to retrieve items")
            })
    })
}

// Get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category }
        })
            .then((data) => {
                if (data.length > 0) {
                    resolve(data)
                } else {
                    reject("No results returned")
                }
            })
            .catch(() => {
                reject("Unable to retrieve items by category")
            })
    })
}

// Get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op

        Item.findAll({
            where: {
                itemDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then((data) => {
                if (data.length > 0) {
                    resolve(data)
                } else {
                    reject("No results returned")
                }
            })
            .catch(() => {
                reject("Unable to retrieve items by date")
            })
    })
}

// Get item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id }
        })
            .then((data) => {
                if (data.length > 0) {
                    resolve(data[0])
                } else {
                    reject("No results returned")
                }
            })
            .catch(() => {
                reject("Unable to retrieve item by ID")
            })
    })
}

// Add a new item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false

        // Replace empty fields with null
        for (let key in itemData) {
            if (itemData[key] === "") {
                itemData[key] = null
            }
        }

        itemData.itemDate = new Date()
        itemData.price = parseFloat(itemData.price);

        console.log("Item data being inserted:", itemData);

        // Create the item
        Item.create(itemData)
            .then(() => {
                resolve("Item successfully added")
            })
            .catch(() => {
                reject("Unable to create item")
            })
    })
}

// Add a new category
function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        // Replace empty fields with null
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null
            }
        }

        // Create the category
        Category.create(categoryData)
            .then(() => {
                resolve("Category successfully added")
            })
            .catch(() => {
                reject("Unable to create category")
            })
    })
}

// Delete a category by ID
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id }
        })
            .then((deleted) => {
                if (deleted) {
                    resolve("Category successfully deleted")
                } else {
                    reject("No category found with that ID")
                }
            })
            .catch(() => {
                reject("Unable to delete category")
            })
    })
}

// Delete an item by ID
function deleteItemById(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id }
        })
            .then((deleted) => {
                if (deleted) {
                    resolve("Item successfully deleted")
                } else {
                    reject("No item found with that ID")
                }
            })
            .catch(() => {
                reject("Unable to delete item")
            })
    })
}

// Get published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true }
        })
            .then((data) => {
                if (data.length > 0) {
                    resolve(data)
                } else {
                    reject("No results returned")
                }
            })
            .catch(() => {
                reject("Unable to retrieve published items")
            })
    })
}

// Get published items by category
function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category
            }
        })
            .then((data) => {
                if (data.length > 0) {
                    resolve(data)
                } else {
                    reject("No results returned")
                }
            })
            .catch(() => {
                reject("Unable to retrieve published items by category")
            })
    })
}

// Get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                if (data.length > 0) {
                    resolve(data)
                } else {
                    reject("No results returned")
                }
            })
            .catch(() => {
                reject("Unable to retrieve categories")
            })
    })
}

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    addCategory,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    getPublishedItemsByCategory,
    deleteCategoryById,
    deleteItemById,
    sequelize
}
