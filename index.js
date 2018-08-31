console.log('beep boop');

/* Read JSON data from file */
function readFile(file, next) {
  d3.json(file, function(error, assignments) {
    if(error) return next(error, null);
    return next(null, assignments);
  });
}


/*
 * *
 * * *

    P O I N T   O F   E N T R Y

 * * *
 * *
 */
/* first read JSON data from file */
new Promise(function(resolve, reject) {
  $.ajax({
     type: "GET",
     contentType: "application/json; charset=utf-8",
     url: '/data',
     dataType: 'json',
     async: true,
     success: function (data) {
       console.log("AJAX", data);
        resolve(data);
     },
     error: function (result) {
       console.log(result);
     }
   });
  // readFile("./tmp.json", function(err, data) {
  //   if(err) reject(err);
  //   else resolve(data);
  // });
}).then(function(data) {  // then collect the categories
  return new Promise(function(resolve, reject) {
    resolve(matrixVis.categories(data));
  });
}).then(function(data) {  // then bind UI stuff
  return new Promise(function(resolve, reject) {
    resolve(matrixVis.bindUI(data));
  });
}).then(function(stuff){ // then visualize the matrix
  matrixVis.matrix(stuff);
  assignmentSelectionVis.setup();
  assignmentComparisonVis.setup();

  stuff.rows.map(function(d) {
    AssignmentSelection.addAssignment(d);
  });
});
