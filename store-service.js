
const fs = require('fs');

let items = [];
let categories = [];

module.exports = {

    initialize: function() {
        return new Promise((resolve, reject) => {
            // Read the items.json file
            fs.readFile(path.join(__dirname, 'data/items.json'), 'utf8', (err, data) => {
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
			});
                // Once items are loaded, read categories.json file
                fs.readFile(path.join(__dirname, 'data/categories.json'), 'utf8', (err, data) => {
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
    getPublishedItemsByCategory: function(category) {

        return new Promise((resolve, reject) => {
            const filteredItems = items.filter(item => item.category === parseInt(category, 10) && item.published === true );
            
            if (filteredItems.length > 0) {
                resolve(filteredItems);
            } else {
                reject("no results returned");
            }
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
            if (categories.length > 0) {
                resolve(categories);
            } else {
                reject('no results returned');
            }
        });
    },
    addItem(itemData) {
        return new Promise((resolve, reject) => {
            // Set 'published' to false if undefined, else set to true
            if (itemData.published === undefined) {
                itemData.published = false;
            } else {
                itemData.published = true;
            }
    
            // Set the 'id' property to the length of 'items' array plus one
            itemData.id = items.length + 1;
    
            // Push the updated itemData onto the 'items' array
            items.push(itemData);
    
            // Resolve the promise with the updated itemData
            resolve(itemData);
        });
    },
    getItemsByCategory(category) {
        return new Promise((resolve, reject) => {
            const filteredItems = items.filter(item => item.category === parseInt(category, 10));
            
            if (filteredItems.length > 0) {
                resolve(filteredItems);
            } else {
                reject("no results returned");
            }
        });
    },
    getItemsByMinDate(minDateStr) {
        return new Promise((resolve, reject) => {
            const minDate = new Date(minDateStr);
            const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
    
            if (filteredItems.length > 0) {
                resolve(filteredItems);
            } else {
                reject("no results returned");
            }
        });
    },
    getItemById(id) {
        return new Promise((resolve, reject) => {
            const foundItem = items.find(item => item.id === parseInt(id, 10));
    
            if (foundItem) {
                resolve(foundItem);
            } else {
                reject("no result returned");
            }
        });
    }
    
    
    
};