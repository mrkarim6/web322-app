
const fs = require('fs');
const path = require("path")
let items = [];
let categories = [];
//const Sequelize = require('sequelize');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('web322', 'web322_owner', 'XVpqYd95LOvQ', {
    host: 'ep-bold-mountain-a5kgp46k.us-east-2.aws.neon.tech', // Replace 'host' with your actual host
    dialect: 'postgres',
    port: 5432, // Default PostgreSQL port
    dialectOptions: {
        ssl: { rejectUnauthorized: false } // For secure SSL connections
    },
    query: { raw: true } // Return raw query results
});

const Item = sequelize.define('Item', {
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    itemDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    featureImage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    }
}, {
    timestamps: false
});

const Category = sequelize.define('Category', {
    category: {
        type: DataTypes.STRING,
        allowNull: false, // Enforces non-null values
        validate: {
            notEmpty: true // Ensures the field is not an empty string
        }
    }
}, {
    timestamps: false
});

/*
const Category = sequelize.define('Category', {
    category: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});*/

Item.belongsTo(Category, { foreignKey: 'category', onDelete: 'SET NULL' });

module.exports = {
    initialize : function() {
        return new Promise((resolve, reject) => {
            sequelize.sync()
                .then(() => {
                    console.log('Database synced successfully.');
                    resolve(); // Notify success
                })
                .catch((error) => {
                    console.error('Unable to sync the database:', error);
                    reject('Unable to sync the database'); // Notify failure with a message
                });
        });
    },

    getAllItems: function() {

        return new Promise((resolve, reject) => {
            Item.findAll()
                .then((items) => {
                    if (items.length > 0) {
                        resolve(items); // Resolve with the data if items exist
                    } else {
                        reject('no results returned - 1'); // Reject if no items are found
                    }
                })
                .catch((error) => {
                    console.error('Error fetching items:', error);
                    reject('no results returned 2'); // Reject with a meaningful message in case of an error
                });
        });
    },
    getPublishedItems: function(data) {
        return new Promise((resolve, reject) => {
            reject();
            })
    }, 
    getPublishedItemsByCategory: function(category) {

        return new Promise((resolve, reject) => {
            Item.findAll({
                where: { published: true } 
            })
                .then((items) => {
                    if (items.length > 0) {
                        resolve(items); // Resolve with the data if items exist
                    } else {
                        reject('no results returned - 1'); // Reject if no items are found
                    }
                })
                .catch((error) => {
                    console.error('Error fetching items:', error);
                    reject('no results returned 2'); // Reject with a meaningful message in case of an error
                });
        });

        /*return new Promise((resolve, reject) => {
            const publishedItemsByCategory = items.filter(item => item.published === true && item.category === category);
            if (publishedItemsByCategory.length > 0) {
                resolve(publishedItemsByCategory);
            } else {
                reject('no results returned for the specified category');
            }
        });*/
    },
    getCategories: function() {
        return new Promise((resolve, reject) => {

            Category.findAll()
                .then((rows) => {
                    if (rows.length > 0) {
                        resolve(rows); // Resolve with the data if items exist
                    } else {
                        reject('no results returned - 1'); // Reject if no items are found
                    }
                })
                .catch((error) => {
                    console.error('Error fetching items:', error);
                    reject('no results returned 2'); // Reject with a meaningful message in case of an error
                });

            //reject();
        })
    },
    addItem(itemData) {

        return new Promise((resolve, reject) => {
            // Ensure the "published" property is explicitly set to true or false
            itemData.published = itemData.published ? true : false;
    
            // Replace empty string values ("") with null
            for (let key in itemData) {
                if (itemData[key] === "") {
                    itemData[key] = null;
                }
            }
    
            // Assign the current date to "itemDate"
            itemData.itemDate = new Date();
    
            // Create the item in the database
            Item.create(itemData)
                .then(() => {
                    resolve(); // Notify success
                })
                .catch((error) => {
                    console.error('Error creating item:', error);
                    reject('unable to create item'); // Notify failure
                });
        });
    },
    addCategory(categoryData) {
        return new Promise((resolve, reject) => {
            for (let key in categoryData) {
                if (categoryData[key] === "" ) {
                    categoryData[key] = null;
                }
            }
    
            if (!categoryData.category) {
                return reject('Category name cannot be empty');
            }
            
            Category.create(categoryData)
                .then(() => {
                    resolve(); // Notify success
                })
                .catch((error) => {
                    console.error('Error creating category:', error);
                    reject('unable to create category'); // Notify failure
                });
        });
    },

    deleteCategoryById(id) {
        return new Promise((resolve, reject) => {
            Category.destroy({
                where: { id: id } // Filter by "id"
            })
                .then((deletedCount) => {
                    if (deletedCount > 0) {
                        resolve(); // Resolve if at least one category was deleted
                    } else {
                        reject('no category found with the provided ID'); // Reject if no category matched the ID
                    }
                })
                .catch((error) => {
                    console.error('Error deleting category:', error);
                    reject('unable to delete category'); // Reject in case of an error
                });
        });
    },
    deleteItemById(id) {
        return new Promise((resolve, reject) => {
            Item.destroy({
                where: { id: id } // Filter by "id"
            })
                .then((deletedCount) => {
                    if (deletedCount > 0) {
                        resolve(); // Resolve if at least one item was deleted
                    } else {
                        reject('no item found with the provided ID'); // Reject if no item matched the ID
                    }
                })
                .catch((error) => {
                    console.error('Error deleting item:', error);
                    reject('unable to delete item'); // Reject in case of an error
                });
        });
    },
    getItemsByCategory(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: { category: category } // Filter by the "category" column
            })
                .then((items) => {
                    if (items.length > 0) {
                        resolve(items); // Resolve with the data if items exist
                    } else {
                        resolve([]);
                        //reject('no results returned - 1'); // Reject if no items are found
                    }
                })
                .catch((error) => {
                    console.error('Error fetching items:', error);
                    reject('no results returned 2'); // Reject with a meaningful message in case of an error
                });
        });
    },
    getItemsByMinDate(minDateStr) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    itemDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            
            })
                .then((items) => {
                    if (items.length > 0) {
                        resolve(items); // Resolve with the data if items exist
                    } else {
                        resolve([]);
                        //reject('no results returned - 1'); // Reject if no items are found
                    }
                })
                .catch((error) => {
                    console.error('Error fetching items:', error);
                    reject('no results returned 2'); // Reject with a meaningful message in case of an error
                });
        });
    },
    getItemById(id) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: { id: id } // Filter by the "category" column
            })
                .then((items) => {
                    if (items.length > 0) {
                        resolve(items); // Resolve with the data if items exist
                    } else {
                        reject('no results returned - 1'); // Reject if no items are found
                    }
                })
                .catch((error) => {
                    console.error('Error fetching items:', error);
                    reject('no results returned 2'); // Reject with a meaningful message in case of an error
                });
        });
    }
};