const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const uri = "mongodb+srv://reazulk:Aa123456@cluster0.ljkzb.mongodb.net/web322?retryWrites=true&w=majority"
const clientOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
    }
}

// Define the schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
})

// Create the model outside of the initialize function
const User = mongoose.model("users", userSchema)

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(uri, clientOptions)
            .then(() => {
                console.log("MongoDB connection successful")
                resolve()
            })
            .catch((err) => {
                console.error("MongoDB connection error:", err)
                reject(err)
            })
    })
}

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match")
        } else {
            bcrypt.hash(userData.password, 10)
                .then((hash) => {
                    // Create a new user object with hashed password
                    const newUser = new User({
                        userName: userData.userName,
                        password: hash,
                        email: userData.email
                    })

                    // Save the new user
                    return newUser.save()
                })
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    if (err.code === 11000) {
                        reject("User Name already taken")
                    } else {
                        reject("There was an error creating the user: " + err)
                    }
                })
        }
    })
}

module.exports.CheckUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    reject("Unable to find user: " + userData.userName)
                    return
                }

                return bcrypt.compare(userData.password, user.password)
                    .then((result) => {
                        if (result === true) {
                            // Update login history
                            user.loginHistory.push({
                                dateTime: new Date(),
                                userAgent: userData.userAgent
                            })

                            return user.save()
                                .then(() => {
                                    resolve(user)
                                })
                        } else {
                            reject("Incorrect Password for user: " + userData.userName)
                        }
                    })
            })
            .catch((err) => {
                reject("There was an error verifying the user: " + err)
            })
    })
}