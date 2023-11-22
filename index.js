const express = require('express')
const app = express()

app.get("/", function(req, res) {
    res.send("Hi from express")
})

const port = 8000
app.listen(port, () => {
    console.log("Running on port " + port)
})