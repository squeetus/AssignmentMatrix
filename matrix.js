(function() {

  /* Read JSON data from file */
  function readFile(file, next) {
    d3.json(file, function(error, assignments) {
      if(error) return next(error, null);
      return next(null, assignments);
    });
  }

  /* Pull topics, languages, classes, and categories from each assignment */
  function collectCategories(assignments) {
    let categories = {
      'topics': [],
      'languages': [],
      'classifications': [],
      'assignments': []
    };

    // add unique item to an array
    function addUnique(arr, item) {
      if(arr.indexOf(item)<0) {
        arr.push(item);
      }
    }

    // Iterate through all assignments
    Object.values(assignments).map((assignment) => {
        categories.assignments.push(assignment.fields.title);
        // note each topic
        for (var topic of assignment.fields.topics) {
          addUnique(categories.topics, topic);
        }
        // note each language
        for (var language of assignment.fields.languages) {
          addUnique(categories.languages, language);
        }
        // note each classification
        for (var classification of assignment.fields.classifications) {
          addUnique(categories.classifications, classification);
        }
    });

    return {'categories': categories, 'assignments': assignments};
  }

  /* Create a matrix chart */
  function matrix(data) {
    var margin = {top: 80, right: 0, bottom: 10, left: 150},
        width = 750,
        height = 500;

    var rows = d3.scaleBand().rangeRound([0, height]),
        cols1 = d3.scaleBand().rangeRound([0, width]).padding(0.05),
        z = d3.scaleLinear().domain([0,1000]).clamp(true);
        // c = d3.scaleCategory10().domain(d3.range(10));


    /*
     *  S O R T   D A T A
     *
     */
    // sort assignments alphabetically by name
    data.assignments = data.assignments.sort(function(a, b) { return d3.ascending(a.fields.title, b.fields.title); });
    // sort topics (alphabetically by name?)
    data.categories.topics = data.categories.topics.sort(function(a, b) { return d3.ascending(a, b); });

    // set domains of x and y1 scales
    rows.domain(d3.range(data.assignments.length));
    cols1.domain(data.categories.topics);
    // cols2.domain(data.categories.languages);
    // set up SVG element
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", -margin.left + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // map assignment names to rows
    var row = svg.selectAll(".row")
        .data(data.assignments)
      .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) {
          return "translate(0," + rows(i) + ")"; })
        .each(row);

    row.append("line")
          .attr("x2", width);

    // assignment titles as row labels
    row.append("text")
        .attr("x", 0)
        .attr("y", rows.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return d.fields.title; });

    // map topics (etc) to columns
    var topics = svg.selectAll(".column")
          .data(data.categories.topics)
        .enter().append("g")
          .attr("class", "column")
          .attr("transform", function(d, i) { return "translate(" + cols1(d) + ")rotate(-90)"; });

    topics.append("line")
        .attr("x1", -width);

    // topics (etc) as column labels
    topics.append("text")
        .attr("x", 6)
        .attr("y", cols1.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return d; });

    // create each cell
    function row(row) {
        console.log(row);
        var cell = d3.select(this).selectAll(".cell")
            .data(row.fields.topics)
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d, i) { return cols1(d); })
            .attr("rowName", row.fields.title)
            .attr("colName", function(d, i) {return d;})
            .attr("width", cols1.bandwidth())
            .attr("height", rows.bandwidth())
            .style("fill-opacity", function(d) { return 1; })
            .style("fill", function(d) { return 'lightblue';})
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
      }

      function mouseover(sq) {
        let rowName = d3.select(this).attr("rowName");
        let colName = d3.select(this).attr("colName");
        d3.select(this).style("fill", function(d) { return 'blue';});
        d3.selectAll(".row text").classed("active", function(d, i) { return d.fields.title == rowName; });
        d3.selectAll(".column text").classed("active", function(d, i) { return d == sq; });
        console.log(rowName, colName,data.assignments);
      }

      function mouseout() {
        d3.select(this).style("fill", function(d) { return 'lightblue';});
        d3.selectAll("text").classed("active", false);
      }
  }





//
//   d3.select("#order").on("change", function() {
//     clearTimeout(timeout);
//     order(this.value);
//   });
//
//   function order(value) {
//     x.domain(orders[value]);
//
//     var t = svg.transition().duration(2500);
//
//     t.selectAll(".row")
//         .delay(function(d, i) { return x(i) * 4; })
//         .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
//       .selectAll(".cell")
//         .delay(function(d) { return x(d.x) * 4; })
//         .attr("x", function(d) { return x(d.x); });
//
//     t.selectAll(".column")
//         .delay(function(d, i) { return x(i) * 4; })
//         .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
//   }
//
//   var timeout = setTimeout(function() {
//     order("group");
//     d3.select("#order").property("selectedIndex", 2).node().focus();
//   }, 5000);
// });


  /*
   * *
   * * *

      P O I N T   O F   E N T R Y

   * * *
   * *
   */

  /* first read JSON data from file */
  new Promise(function(resolve, reject) {
    readFile("./sample.json", function(err, data) {
      if(err) reject(err);
      else resolve(data);
    });
  }).then(function(data) {  // then collect the categories
    return new Promise(function(resolve, reject) {
      resolve(collectCategories(data));
    });
  }).then(function(stuff){ // then do something with it
    // console.log(stuff);
    matrix(stuff);
  });

// fin
})();
