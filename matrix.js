(function() {
  let matrixArgument = "topics";

  /* Read JSON data from file */
  function readFile(file, next) {
    d3.json(file, function(error, assignments) {
      if(error) return next(error, null);
      return next(null, assignments);
    });
  }

  /* Pull topics, languages, classes, and categories from each assignment */
  function collectCategories(data) {
    let categories = {
      'topics': data.topics,
      'languages': data.languages,
      'classifications': data.classifications,
      // 'columns': [],
      'assignments': []
    };

    // add unique item to an array
    function addUnique(arr, item) {
      if(arr.indexOf(item)<0) {
        arr.push(item);
      }
    }

    // Iterate through all assignments
    Object.values(data.assignments).map((assignment) => {
        categories.assignments.push(assignment.fields.title);
        // note each topic
        // for (var topic of assignment.fields.topics) {
        //   console.log(topic, data.topics[topic]);
        //   // addUnique(categories.topics, data.topics[topic]);
        // }
        // // note each language
        // for (var language of assignment.fields.languages) {
        //   addUnique(categories.languages, language);
        // }
        // // note each classification
        // for (var classification of assignment.fields.classifications) {
        //   addUnique(categories.classifications, classification);
        // }
    });

    data = {'categories': categories, 'assignments': data.assignments};

    /*
     *  S O R T   D A T A
     *
     */
    // sort assignments alphabetically by name
    data.assignments = data.assignments.sort(function(a, b) { return d3.ascending(a.fields.title, b.fields.title); });

    // reseed assignment titles based on new order
    data.categories.assignments = [];
    for(let i = 0; i < data.assignments.length; i++) {
      data.categories.assignments.push(data.assignments[i].fields.title);
    }

    // sort columns (alphabetically by name?)
    // NO - because we are indexing in to this list with integers, so sorting will break that association
    // data.categories[matrixArgument] = data.categories[matrixArgument].sort(function(a, b) { return d3.ascending(a, b); });

    return data;
  }

  function bindUI(data) {
    uiOpts = {
        "topics": {
          "cellColor": "#42B3D5",
          "highlightColor": "#1A237E"
        },
        "languages": {
          "cellColor": "#E4521B",
          "highlightColor": "#4D342F"
        },
        "classifications": {
          "cellColor": "#42B3D5",
          "highlightColor": "#1A237E"
        },
    };

    var select = d3.select('body')
      .append('select')
      	.attr('class','select')
        .on('change',onchange);

    var options = select
      .selectAll('option')
    	.data(['topics', 'languages', 'classifications']).enter()
    	.append('option')
    		.text(function (d) { return d; });

    function onchange() {
    	let matrixArgument = d3.select('select').property('value');

      // redraw matrix with current data selection
      matrix({"rows": data.assignments, "rowNames": data.categories.assignments, "columns": data.categories[matrixArgument], "columnTitle": matrixArgument, "uiOpts": uiOpts[matrixArgument]});
    }

    return {"rows": data.assignments, "rowNames": data.categories.assignments, "columns": data.categories[matrixArgument], "columnTitle": matrixArgument, "uiOpts": uiOpts[matrixArgument]};
  }

  /* Create a matrix chart */
  function matrix(data) {
    var margin = {top: 150, right: 0, bottom: 10, left: 150},
        width = 12*data.columns.length,
        height = 11*data.rows.length;

    var rows = d3.scaleBand().rangeRound([0, height]),
        cols1 = d3.scaleBand().rangeRound([0, width]).padding(0.05);

    // set domains of row and col scales
    // rows.domain(d3.range(data.assignments.length));
    rows.domain(data.rowNames);
    cols1.domain(d3.range(data.columns.length));

    // set up SVG element
    d3.selectAll("svg").remove();
    var svg = d3.select('body')
      .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", -margin.left + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // map assignment names to rows
    var row = svg.selectAll(".row")
        .data(data.rows)
      .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) {
          return "translate(0," + rows(d.fields.title) + ")"; })
        .each(row);

    row.append("line")
          .attr("x2", width);

    // assignment titles as row labels
    row.append("text")
        .attr("x", 0)
        .attr("y", rows.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return d.fields.title; })
        .on("mouseover", rowMouseover)
        .on("mouseout", textMouseout)
        .style("cursor", "default");

    // map topics (etc) to columns
    var columns = svg.selectAll(".column")
          // .data(data.categories.topics)
          .data(data.columns)
        .enter().append("g")
          .attr("class", "column")
          .attr("transform", function(d, i) { return "translate(" + cols1(i) + ")rotate(-90)"; });

    columns.append("line")
        .attr("x1", -width);

    // topics (etc) as column labels
    columns.append("text")
        .attr("x", 6)
        .attr("y", cols1.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return d; })
        .on("mouseover", colMouseover)
        .on("mouseout", textMouseout)
        .on("click", colClick)
        .style("cursor", "default");

    // create each cell
    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            // .data(row.fields.topics)
            .data(row.fields[data.columnTitle])
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d, i) { return cols1(d); })
            .attr("rowName", row.fields.title)
            .attr("colName", function(d, i) {return d;})
            .attr("width", cols1.bandwidth())
            .attr("height", rows.bandwidth())
            .style("fill-opacity", function(d) { return 1; })
            .style("fill", function(d) { return data.uiOpts.cellColor;})
            .on("mouseover", cellMouseover)
            .on("mouseout", cellMouseout);
      }

    function cellMouseover(sq) {
      let rowName = d3.select(this).attr("rowName");
      let cell = d3.select(this);
      cell.style("fill", function(d) { return highlightColor; });
      d3.selectAll(".row text").classed("active", function(d, i) { return d.fields.title == rowName; });
      d3.selectAll(".column text").classed("active", function(d, i) { return i == sq; });

      d3.selectAll(".cell").style("opacity", 0.2);
      cell.style("opacity", 1);
      console.log(cell);
    }

    function cellMouseout() {
      d3.select(this).style("fill", data.uiOpts.cellColor);
      d3.selectAll("text").classed("active", false);
      d3.selectAll(".cell").style("opacity", 1);
    }

    function colMouseover(colName, index) {
      // highlight that col label
      d3.select(this).classed("active", true);

      // highlight all cells that match the column
      d3.selectAll(".cell")
        .style("fill", function(d, i) {
          return d == index ? data.uiOpts.highlightColor : data.uiOpts.cellColor;
        })
        .style("opacity", function(d, i) {
            return d == index ? 1 : 0.2;
        });

      // highlight all assignments that use this column
      d3.selectAll(".row text").classed("active", function(d, i) {
        for(let topic of d.fields[data.columnTitle]) {
          if(topic == index) return true;
        }
        return false; });

      // make extraneous rows opaque
      d3.selectAll(".row text").style("opacity", function(d, i) {
        for(let topic of d.fields[data.columnTitle]) {
          if(topic == index) return 1;
        }
        return 0.2; });
    }

    function rowMouseover(row, index) {
      // highlight that row label
      d3.select(this).classed("active", true);

      // highlight all cells that match the row
      d3.selectAll(".cell")
        .style("fill", function(d, i) {
          let rowName = d3.select(this).attr("rowName");
          return rowName == row.fields.title ? data.uiOpts.highlightColor : data.uiOpts.cellColor;
        })
        .style("opacity", function(d, i) {
          let rowName = d3.select(this).attr("rowName");
          return rowName == row.fields.title ? 1 : 0.2;
        });

      // highlight all columns that associated with this row
      d3.selectAll(".column text").classed("active", function(d, i) {
        for(let topic of row.fields[data.columnTitle]) {
          if(topic == i) return true;
        }
        return false; });

      // make extraneous cols opaque
      d3.selectAll(".column text").style("opacity", function(d, i) {
        for(let topic of row.fields[data.columnTitle]) {
          if(topic == i) return 1;
        }
        return 0.2; });
    }

    function textMouseout() {
      d3.selectAll(".cell").style("fill", data.uiOpts.cellColor).style("opacity", 1);
      d3.selectAll("text").classed("active", false);
      d3.selectAll("text").style("opacity", 1);
      // d3.selectAll(".column").style("opacity", 1);
    }

    /* Allow reordering of rows based on the column content */
    function colClick(col) {
      let topicIndex = data.columns.indexOf(col);

      // sort actual assignment data on presence of topic
      data.rows = data.rows.sort(function(a, b) {
        return d3.descending(a.fields[data.columnTitle].indexOf(topicIndex), b.fields[data.columnTitle].indexOf(topicIndex));
      });

      // reseed assignment titles based on new order
      data.rowNames = [];
      for(let i = 0; i < data.rows.length; i++) {
        data.rowNames.push(data.rows[i].fields.title);
      }

      // reset domain of row scale
      rows.domain(data.rowNames);

      // transition rows to new ordering
      var t = svg.transition().duration(1000);
      t.selectAll(".row")
          .attr("transform", function(d, i) {
            return "translate(0," + rows(d.fields.title) + ")"; });
    }
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
    readFile("./scrape.json", function(err, data) {
      if(err) reject(err);
      else resolve(data);
    });
  }).then(function(data) {  // then collect the categories
    return new Promise(function(resolve, reject) {
      resolve(collectCategories(data));
    });
  }).then(function(data) {  // then bind UI stuff
    return new Promise(function(resolve, reject) {
      resolve(bindUI(data));
    });
  }).then(function(stuff){ // then visualize the matrix
    matrix(stuff);
  });

// fin
})();
