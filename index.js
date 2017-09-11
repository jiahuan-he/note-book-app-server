const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://Geoffrey-He:375812db@ds151963.mlab.com:51963/note-book-app');

const app = express();

app.use(tempAllowCORS);
const tempAllowCORS = function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
};


const Notebook = mongoose.model('Notebook', {
    uid: String,
    content: {
        title: String,
        createDate: Date,
        notebookId: String,
        pages: [String]

    }
});

const newNotebook = {
  uid: "uid123",
    content:{
        title: "notebook-title",
        createDate: new Date(),
        notebookId: "123",
        pages: ["333", "222", "111"]
    }
};

Notebook.create(newNotebook , (err, newlyCreated)=>{
    if(err){
        console.log(err);
    } else {
        //redirect back to campgrounds page
        console.log(newlyCreated);
    }
});


app.get('/', function (req, res, next) {
    res.send('get')
});

app.post('/', function(req, res, next) {
    res.send('post')
});


app.listen(3001, function() {
  console.log('Node app is running');
});
