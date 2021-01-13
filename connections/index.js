require('dotenv').config()

module.exports = {
    boston: {
        url: process.env.boston || "postgresql://localhost/boston20210112",
        name: "MBTA (Boston)"
    }
}