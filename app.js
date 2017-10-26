const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

if(!process.env.MONGO_URL){
    console.log("mongo url not set");
}
mongoose.connect(process.env.MONGO_URL);
const app = express();

const tempAllowCORS = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};

console.log("cors allowed");
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

app.delete('/pages', function (req, res) {

    const uid = req.query.uid;
    const pageId = req.query.pageId;
    const notebookId = req.query.notebookId;
    Page.remove({uid: uid, pageId: pageId}, function (err){
        if(err){
            res.send(err);
        }
        else{
            Note.remove({uid: uid, targetPageId: pageId}, function (err) {
                if(err){
                    res.send(err);
                }
                else{
                    Notebook.findOne({uid: uid, notebookId: notebookId}, function (err, notebook) {
                        if(err){
                            res.send(err)
                        }
                        else{
                            const index = notebook.pages.indexOf(pageId);
                            notebook.pages.splice(index, 1);
                            notebook.save( function (err, updatedNotebook) {
                                if(err){
                                    res.send(err)
                                }
                                else{
                                    res.send({pageId, notebookId});
                                }
                            });
                        }
                    })
                }
            })
        }
    })
});


app.delete('/notebooks', function (req, res) {

    const uid = req.query.uid;
    const notebookId = req.query.notebookId;
    let pages = [];
    Notebook.findOne({uid: uid, notebookId: notebookId}, function (err, notebook) {
       if(err){
           res.send(err)
       }
       else{
           pages = notebook.pages;
           Notebook.remove({uid: uid, notebookId: notebookId}, function (err){
               if(err){
                   res.send(err);
               }
               else{
                   Page.remove({uid: uid, notebookId: notebookId}, function (err) {
                       if(err){
                           res.send(err);
                       }
                       else{
                           pages.forEach((targetPageId) => {
                               Note.remove({targetPageId: targetPageId}, function (err) {
                                   if(err){
                                       res.send(err)
                                   }
                               })
                           });
                           res.send({notebookId: notebookId});
                       }
                   })
               }
           })
       }
    });


});


var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Node app is running');
});
