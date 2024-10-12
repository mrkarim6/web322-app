
const fs = require('fs');

let items = [];
let categories = [];

module.exports = {

    initialize: function() {
        return new Promise((resolve, reject) => {
            // Read the items.json file
            fs.readFile('./data/items.json', 'utf8', (err, data) => {
                if (err) {
                    reject('unable to read file items.json');
                    return;
                }
                try {
                    items = JSON.parse(data); // Parse the JSON data into an array of objects
                } catch (e) {
                    reject('unable to parse items.json');
                    return;
                }

                // Once items are loaded, read categories.json file
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject('unable to read file categories.json');
                        return;
                    }
                    try {
                        categories = JSON.parse(data); // Parse the JSON data into an array of objects
                    } catch (e) {
                        reject('unable to parse categories.json');
                        return;
                    }

                    // Both files read successfully, resolve the promise
                    resolve();
                });
            });
        });
    },
    getAllItems: function() {
        return new Promise((resolve, reject) => {
            if (items.length > 0) {
                resolve(items);
            } else {
                reject('no results returned');
            }
        });
    },
    getPublishedItems: function(data) {
        return new Promise((resolve, reject) => {
            const publishedItems = items.filter(item => item.published === true);
            if (publishedItems.length > 0) {
                resolve(publishedItems);
            } else {
                reject('no results returned');
            }
        });
    },
    getCategories: function() {
        return new Promise((resolve, reject) => {
            if (categories.length > 0) {
                resolve(categories);
            } else {
                reject('no results returned');
            }
        });
    }
};