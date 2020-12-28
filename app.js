const dotenv = require("dotenv").config();
const express = require('express')
const app = express()
const port = 3000
const multer = require('multer')
const AWS = require('aws-sdk');
const uuid = require('uuid')
const mysql      = require('mysql');

const connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
  });

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
const insert_video_info = (url,description)=>{
    connection.query(`INSERT INTO video_info (id, description, url) VALUES (NULL, '${String(description)}', '${String(url)}');`,(err, result)=>{
        if (err) throw err;
        console.log("1 record inserted");
    })
}


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
        insert_video_info(String(data.Location),"Demo Description")
    })
})

app.get('/watch',(req,res)=>{
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `1609095920161.mp4`,
    }
   let stream =  s3.getObject(param).createReadStream();
   stream.pipe(res)


})




app.listen(port)