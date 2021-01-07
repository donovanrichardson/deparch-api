require('dotenv').config()

module.exports = {
    boston: {
        url: process.env.boston || "postgresql://localhost/mbta",
        name: "MBTA (Boston)"
    }
}