const dotenv = require("dotenv").config();
const express = require('express')
const app = express()
const port = 3000
const multer = require('multer')
const AWS = require('aws-sdk');
const uuid = require('uuid')

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})
const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '')
    }
})
const upload = multer({ storage }).single('my_file')

app.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname })
})
app.post('/upload', upload, (req, res) => {
    let myImage = req.file.originalname.split(".")

    const fileType = myImage[myImage.length - 1]
    console.log(req.file)
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}.${fileType}`,
        Body: req.file.buffer
    }
    s3.upload(param, (error, data) => {
        if (error) {
            res.status(500).send(error)
        }
        res.status(200).send(data)
    })
})




app.listen(port)