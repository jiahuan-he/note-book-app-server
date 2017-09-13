const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URL);

const app = express();
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

app.use(tempAllowCORS);
app.use(bodyParser.json());

const Notebook = mongoose.model('Notebook', {
    uid: String,
    title: String,
    createDate: Date,
    notebookId: String,
    pages: [String]
});


const Page = mongoose.model('Page', {
    uid: String,
    title: String,
    createDate: Date,
    pageId: String,
    notebookId: String,
});

const Note = mongoose.model('Note', {
    uid: String,
    targetPageId: String,
    note: Object
});
//
// const newNotebook = {
//   uid: "uid123",
//         title: "notebook-title",
//         createDate: new Date(),
//         notebookId: "123",
//         pages: ["333", "222", "111"]
// };
//
//     Notebook.create(newNotebook , (err, newlyCreated)=>{
//         if(err){
//             console.log(err);
//         } else {
//             console.log("created new notebook");
//         }
//     });


app.get('/', function (req, res, next) {
    res.send('get')
});

app.post('/notebooks', function(req, res) {
    const newNotebook = req.body;
    Notebook.create( newNotebook, (err, newlyCreated) => {
       if(err){
           res.send(err);
       }
       else{
           res.send({
               title: newlyCreated.title,
               createDate: newlyCreated.createDate,
               notebookId: newlyCreated.notebookId,
               pages: newlyCreated.pages,
           });
       }
    })
});


app.post('/pages', function(req, res) {
    const newPage = req.body;
    Page.create( newPage, (err, newlyCreated) => {
        if(err){
            res.send(err);
        }
        else{
            res.send({
                title: newlyCreated.title,
                createDate: newlyCreated.createDate,
                pageId: newlyCreated.pageId,
                notebookId: newlyCreated.notebookId,
            });
        }
    })
});

app.post('/notes', function (req, res) {
    const uid = req.body.uid;
    const targetPageId = req.body.targetPageId;
    Note.findOne( {uid: uid, targetPageId: targetPageId}, function (err, notes) {
        if( err ){
            res.send(err);
        }
        else{
            if(notes){

            }
            else{
                const newNotes = req.body;
                Note.create(newNotes, (err, newlyCreated) => {
                   if(err){
                       res.send(err);
                   }
                   else{
                       res.send({
                            targetPageId: newNotes.targetPageId,
                            note: newNotes.note
                       })
                   }
                });
            }
        }
    })
});




app.listen(3001, function() {
  console.log('Node app is running');
});
