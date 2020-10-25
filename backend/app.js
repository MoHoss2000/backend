const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { json } = require('body-parser');
const Student = require('./models/student');
const Admin = require('./models/admin');
const admin = require('./models/admin');

const app = express();

mongoose.connect("mongodb+srv://mido:1234@cluster0-vjex6.gcp.mongodb.net/node-angular", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log("DB Connected") })
    .catch(() => console.log("DB connection failed"));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// var CodeGenerator = require('node-code-generator');
// const { Code } = require('bson');
// var generator = new CodeGenerator();
// var pattern = '******';
// var howMany = 100;
// var options = {};
// // Generate an array of random unique codes according to the provided pattern:
// var codes = generator.generateCodes(pattern, howMany, options);

// console.log(codes);

// for(x in codes){
//     const newCode = new Student({
//         _id: codes[x]
//     });
//     newCode.save()//.then(createdCode => console.log('done'));
// }

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

    next();
});

app.post('/api/admin',  async  (req, res, next) => {
    Admin.find({}, async (err, docs) =>  {
        if(err){ 
            res.status(500).json({
                message: 'server error',
                error: err
            });
        }
        console.log(req.body)
        authorizedAdmin = docs[0];
        src = req.body['src'];
        time = req.body['time'];

        authorizedAdmin.src = src;
        authorizedAdmin.time = time;
        await authorizedAdmin.save();

        res.status(200).json({
            message: 'success',
        });

        
    });

})

app.post('/api/login/',  (req, res, next) => {
    Admin.find({}, function (err, docs) {
        if(err){
            res.status(500).json({
                message: 'server error',
                error: err
            });
        }

        authorizedAdmin = docs[0];
        username = req.body['username'];
        password = req.body['password'];
        console.log(authorizedAdmin);

        if(authorizedAdmin._id == username && authorizedAdmin.password == password){
            res.status(200).json({
                message: 'success',
                src: authorizedAdmin.src,
                time: authorizedAdmin.time,
                count: authorizedAdmin.count
            });
        } else{
            res.status(401).json({
                message: 'invalid credentials'
            });
        }
    });


});

app.post('/api/student/', async (req, res, next) => {
    const code = req.body['code'];
    Student.findById(code, async function (err, user) {
        if(err){
            res.status(500).json({
                message: 'server error',
                error: err
            });
        }
        if (!user) {
            res.status(203).json({
                message: 'not found'
            });
        } else {
            if (user.used == true) {
                res.status(203).json({
                    message: 'code already used'
                });
            } else {
                admins = await Admin.find({});
                savedAdmin = admins[0];
                savedAdmin.count++;

                src = savedAdmin.src;
                time = savedAdmin.time;
                user.used = true;
                user.timeUsed = Date.now();

                await savedAdmin.save();
                await user.save();
                res.status(200).json({
                    message: 'success',
                    src: src,
                    time: time
                });
            }
        }
    })


});

module.exports = app;