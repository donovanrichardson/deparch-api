require('dotenv').config()

module.exports = {
    boston: process.env.boston || "postgresql://localhost/mbta"
}