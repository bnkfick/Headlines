// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


// Scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

// Require all models
var db = require("./models");

// Initialize Express
var PORT = process.env.PORT || 3000;

var app = express();

// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));



// Routes
app.get("/", function (req, res) {
    res.send(index.html);
});

// A GET route for scraping the site
app.get("/scrape", function (req, res) {
    console.log("inside scrape");

    axios.get("https://arstechnica.com/").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        $("li header h2").each(function (i, element) {
            //console.log(element);
            var link = $(element).children('a').attr('href');
            console.log(link);
            var title = $(element).children('a').text();
            console.log(title);
            var excerpt = $(element).siblings('.excerpt').text().trim();
            console.log(excerpt);
            
            //var articleCreated = moment().format("YYYY MM DD hh:mm:ss");

            var result = {
                 title: title,
                 link: link,
                 excerpt: excerpt,
            //     articleCreated: articleCreated,
                 isSaved: false
            }

            // console.log(result);

            db.Article.findOne({ title: title }).then(function (data) {

                console.log(data);

                if (data === null) {

                    db.Article.create(result).then(function (dbArticle) {
                        //res.json(dbArticle);
                    });
                }
            }).catch(function (err) {
                console.log(err);
                //res.json(err);
            });
        });
        res.end();
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    db.Article
        .find({})
        .sort({ articleCreated: -1 })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    db.Article
        .findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    db.Note
        .create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating article to be saved
app.put("/saved/:id", function (req, res) {
    db.Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true } })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for getting saved article
app.get("/saved", function (req, res) {
    db.Article
        .find({ isSaved: true })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for deleting/updating saved article
app.put("/delete/:id", function (req, res) {
    db.Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false } })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });



// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
