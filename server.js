var express = require("express");
var app = express();
const cheerio = require('cheerio')
var bodyParser = require("body-parser");
var axios = require('axios');

app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
 


app.get('/scrape', function(req, res){
    axios.get('http://www.echojs.com/').then(function(response){
        const $ = cheerio.load(response.data);



        var result = $('article h2' ).each(element => {
              var whatever =  $(this).children('a');
              console.log(whatever, "------------");
        });
        
        res.send("Scrape complete");
    })
    
    
 

});


app.listen(3000, function(){
    console.log("listening on post 3000");
})