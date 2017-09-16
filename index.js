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
app.use(bodyParser.urlencoded({ extended: true }));

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

            Notebook.findOne({uid: newPage.uid, notebookId: newPage.notebookId}, function (err, notebook){
                if (err){

                }
                else{
                    notebook.pages = notebook.pages.concat(newPage.pageId);
                    notebook.save( function (err, updatedNotebook) {
                        if( err){
                            res.send(err)
                        }
                        else{
                            res.send({
                                updatedNotebook: updatedNotebook,
                                title: newlyCreated.title,
                                createDate: newlyCreated.createDate,
                                pageId: newlyCreated.pageId,
                                notebookId: newlyCreated.notebookId,
                            });
                        }
                    });
                }
            });


        }
    })
});

app.post('/notes', function (req, res) {
    const uid = req.body.uid;
    const targetPageId = req.body.targetPageId;
    Note.findOne( {uid: uid, targetPageId: targetPageId}, function (err, note) {
        if( err ){
            res.send(err);
        }
        else{

            if(note){
                const newNote = req.body.note;
                note.note = newNote;
                note.save( function (err, updatedNote) {
                    if(err){
                        res.send(err);
                    }
                    else{
                        res.send({
                            targetPageId: updatedNote.targetPageId,
                            note: updatedNote.note
                        })
                    }
                })
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

app.get('/notebooks', function (req, res) {
    const uid = req.query.uid;
    Notebook.find({uid: uid}, function (err, notebooks) {
        if( err ){
            res.send(err);
        }
        else{
            res.send(notebooks);
        }
    })
    
});


app.get('/pages', function (req, res) {
    const uid = req.query.uid;
    Page.find({uid: uid}, function (err, pages) {
        if( err ){
            res.send(err);
        }
        else{
            res.send(pages);
        }
    })

});


app.get('/notes', function (req, res) {
    const uid = req.query.uid;
    Note.find({uid: uid}, function (err, notes) {
        if( err ){
            res.send(err);
        }
        else{
            res.send(notes);
        }
    })
});

app.put('/notebooks', function (req, res) {
   const uid = req.body.uid;
   const title = req.body.title;
   const notebookId = req.body.notebookId;
   Notebook.findOne({uid:uid, notebookId: notebookId}, function (err, notebook) {
       notebook.title = title;
       notebook.save( function (err, updatedNotebook) {
           if(err){
               res.send(err);
           }
           else{
               res.send(updatedNotebook);
           }
       })
   })
});


app.put('/pages', function (req, res) {
    const uid = req.body.uid;
    const title = req.body.title;
    const pageId = req.body.pageId;
    Page.findOne({uid:uid, pageId: pageId}, function (err, page) {
        page.title = title;
        page.save( function (err, updatedPage) {
            if(err){
                res.send(err);
            }
            else{
                res.send(updatedPage);
            }
        })
    })
});

app.listen(3001, function() {
  console.log('Node app is running');
});
