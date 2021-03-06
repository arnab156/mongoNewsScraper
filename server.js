var express = require("express");
const cheerio = require('cheerio')
var bodyParser = require("body-parser");
var axios = require('axios');
var logger = require("morgan");
var mongoose = require("mongoose");

var app = express();

var db = require("./models");
app.use(express.static("public"));

var PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(logger("dev"));

//connect to Mondo DB
var MONGODB_URI = (process.env.MONGODB_URI) || ("mongodb://localhost/fakeNewsScraper", { useNewUrlParser: true });
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



app.get('/scrape', function (req, res) {
    axios.get('http://www.foxnews.com/').then(function (response) {
        const $ = cheerio.load(response.data);

        $("article h2").each(function (i, element) {
            // Save an empty result object
            var result = {};
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            console.log("-----", i, result);

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log("dbarticle", dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });
        res.send("Scrape complete. Please refresh the page.");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // console.log("&&&&&&", dbArticle);
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.get("/savedarticles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({saved:true})
        .then(function (dbSavedArticle) {
            // console.log("&&&&&&", dbArticle);
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbSavedArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

app.put("/articles/saved/:id", function (req, res) {
    // console.log("req.body from BACKEND", req.body);
    // console.log("req.params.id:", req.params.id);
    db.Article.updateOne({_id: req.params.id}, {$set : {saved : true}})
    .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});

app.put("/articles/unsave/:id", function (req, res) {
    // console.log("req.body from BACKEND", req.body);
    // console.log("req.params.id:", req.params.id);
    db.Article.updateOne({_id: req.params.id}, {$set : {saved : false}})
    .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});




app.listen(PORT, function () {
    console.log("listening on port" + PORT);
})