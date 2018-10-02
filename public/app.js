// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").prepend("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "<br /> <span> Saved Status:" + data[i].saved + "</p>" + "<button id='saveNews' data-id='" + data[i]._id + "'>Save</button>" + "<br><br />");
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      // console.log("ALL DATA IN LINE 25",data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");

      // An input to enter a new title
      $("#notes").append("<p id='notesInput'>");
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // let dataNotesArray=[];
      // If there's a note in the article
      if (data.note) {
        console.log("UUUUUUUU", data.note);
        $("#savenote").text("Edit");
        let dataNotes = data.note;
        console.log(dataNotes);

        // Place the title of the note in the title input 
        $("#notesInput").append("<h3>" + dataNotes.title + "</h3>");
        $("#titleinput").val(dataNotes.title);
        // Place the body of the note in the body textarea
        $("#notesInput").append(dataNotes.body);
        $("#bodyinput").val(dataNotes.body);
        $("#notesInput").append("<br>");
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  // $("#bodyinput").val("");
});


$(document).on("click", "#saveNews", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  // console.log("app js savenotes ", thisId);
  $.ajax({
    method: "PUT",
    url: "/articles/saved/" + thisId,
    data: {
      "saved": true,
    }
  })
    .then(function (data) {
      // Log the response
      console.log("data back from the promise ",data);
      // button needs to be removed
      // 
    });
  
  // db.Article.update({"_id": thisId}, {$set: {"saved": true}})
  //change saved to true
  //append to another model/scema called saved articles and nottes

});