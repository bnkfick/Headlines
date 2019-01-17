// Parses our HTML and helps us find elements
var cheerio = require("cheerio");
// Makes HTTP request for HTML page
var axios = require("axios");


// Headline - the title of the article
// Summary - a short summary of the article
// URL - the url to the original article
// Feel free to add more content to your database (photos, bylines, and so on).
app.get("/scrape", function (req, res) {
    // Making a request via axios for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
    axios.get("https://old.reddit.com/r/webdev/").then(function (response) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(response.data);

        // An empty array to save the data that we'll scrape
        var results = [];

        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        $("p.title").each(function (i, element) {

            // Save the text of the element in a "title" variable
            var headline = $(element).text();
            var summary;
            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var link = $(element).children().attr("href");
            var photo;

            // Save result in an object 
            result = {
                headline: headline,
                summary: summary,
                link: link,
                photo: photo
            };

            console.log(result);
            //check database to see if it exists already
            //if it doesn't exist insert article

        });
    });
    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    console.log("get /articles");
});

// Route for saving/updating an Article's associated comments
app.post("/articles/:id", function (req, res) {
    console.log("post /articles/:id");
});

// Route for deleting/updating saved article
app.put("/delete/:id", function (req, res) {
    console.log("put /delete/:id");
});



// Set the app to listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});
