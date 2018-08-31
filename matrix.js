(function() {
  let matrixArgument = "topics";

  /* Pull topics, languages, classes, and categories from each assignment */
  function collectCategories(data) {

    data.assignmentNames = [];

    topicCount = {};
    languageCount = {};
    datasetCount = {};
    cCount = {};
    //
    // // Iterate through all assignments
    for(var i in data.assignments) {
    // // // Object.values(data.assignments).map((assignment) => {
      var assignment = data.assignments[i];
      // AssignmentSelection.addAssignment(assignment);
      data.assignmentNames.push(assignment.fields.title);

      // count each topic occurrence
      let topics = assignment.fields.topics;
      for (let i = 0; i < topics.length; i++) {
        let topicName = topics[i];
        if(topicCount[topicName] >= 0) {
          topicCount[topicName]++;
        } else {
          topicCount[topicName] = 1;
        }
      }

      // count each language occurrence
      let languages = assignment.fields.languages;
      for (let i = 0; i < languages.length; i++) {
        let lName = languages[i];
        if(languageCount[lName] >= 0) {
          languageCount[lName]++;
        } else {
          languageCount[lName] = 1;
        }
      }

      // count each data set occurrence
      let datasets = assignment.fields['data_sets'];
      for (let i = 0; i < datasets.length; i++) {
        let ds = datasets[i];
        if(ds != undefined) {
          if(datasetCount[ds] >= 0) {
            datasetCount[ds]++;
          } else {
            datasetCount[ds] = 1;
          }
        }
      }

      // count each data set occurrence
      let classifications = assignment.fields['classifications'];
      for (let i = 0; i < classifications.length; i++) {
        let c = classifications[i];
        if(c != undefined) {
          if(cCount[c] >= 0) {
            cCount[c]++;
          } else {
            cCount[c] = 1;
          }
        }
      }

      data.topics = Object.keys(topicCount).sort(function(a,b){return topicCount[b]-topicCount[a]; });
      data.languages = Object.keys(languageCount).sort(function(a,b){return languageCount[b]-languageCount[a]; });
      data.data_sets = Object.keys(datasetCount).sort(function(a,b){return datasetCount[b]-datasetCount[a]; });
      data.classifications = Object.keys(cCount).sort(function(a,b){return cCount[b]-cCount[a]; });
    }
    // console.log(AssignmentSelection);
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
        "data_sets": {
          "cellColor": "#42B3D5",
          "highlightColor": "#1A237E"
        },
        "classifications": {
          "cellColor": "#42B3D5",
          "highlightColor": "#1A237E"
        }
    };

    d3.select('#topRow')
                .append('div')
                .attr('class', 'col-md-12')
      .append("div")
        .attr("id", "matrixVis");

    var select = d3.select('#matrixVis')
      .append('select')
      	.attr('class','select')
        .on('change',onchange);

    var options = select
      .selectAll('option')
    	.data(['tags', 'languages', 'data_sets', 'classifications']).enter()
    	.append('option')
    		.text(function (d) { return d; });

    function onchange() {
    	let matrixArgument = d3.select('select').property('value');
      if(matrixArgument == "tags") matrixArgument = "topics";
      // redraw matrix with current data selection
      matrix({"rows": data.assignments, "rowNames": data.assignmentNames, "columns": data[matrixArgument], "columnTitle": matrixArgument, "uiOpts": uiOpts[matrixArgument]});
    }

    return {"rows": data.assignments, "rowNames": data.assignmentNames, "columns": data[matrixArgument], "columnTitle": matrixArgument, "uiOpts": uiOpts[matrixArgument]};
  }

  /* Create a matrix chart */
  function matrix(data) {
    var margin = {top: 150, right: 10, bottom: 20, left: 150},
        // width = Math.min(12*data.columns.length, 500);
        // height = Math.min(11*data.rows.length, 600);
        width = 12*data.columns.length;
        height = 11*data.rows.length;

    var rows = d3.scaleBand().rangeRound([0, height]),
        cols1 = d3.scaleBand().rangeRound([0, width]).padding(0.05);

    // set domains of row and col scales
    rows.domain(data.rowNames);
    cols1.domain(data.columns);

    // set up SVG
    d3.selectAll("#matrixSVG").remove();
    var svg = d3.select("#matrixVis")
      .append('svg')
        .attr("id", "matrixSVG")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // .style("margin-left", -margin.left + "px")
        // .style("margin-left", "25px")
        .style("margin-top", "25px")
        // .style("border", "solid 5px black")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // map assignment names to rows
    var row = svg.selectAll(".matrixRow")
        .data(data.rows)
      .enter().append("g")
        .attr("class", "matrixRow")
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
        .on("mousedown", function(d, i) {
          AssignmentSelection.toggleAssignment(d);
        })
        .style("cursor", "default");

    // map topics (etc) to columns
    var columns = svg.selectAll(".column")
          // .data(data.categories.topics)
          .data(data.columns)
        .enter().append("g")
          .attr("class", "column")
          .attr("transform", function(d, i) { return "translate(" + cols1(d) + ")rotate(-90)"; });

    columns.append("line")
        .attr("x1", -height);

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

    // create each cell for the given row
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
            .on("mouseout", cellMouseout)
            .on("mousedown", function(d, i) {
              let assignmentName = d3.select(this).attr("rowName");
              console.log(d3.selectAll(".matrixRow text").filter(function(d, i) { return d.fields.title == assignmentName; }).data()[0]);
            });
      }

    function cellMouseover(sq) {
      let rowName = d3.select(this).attr("rowName");
      let cell = d3.select(this);
      cell.style("fill", function(d) { return data.uiOpts.highlightColor; });
      d3.selectAll(".matrixRow text").classed("active", function(d, i) { return d.fields.title == rowName; });
      d3.selectAll(".column text").classed("active", function(d, i) { return d == sq; });

      d3.selectAll(".cell").style("opacity", 0.2);
      cell.style("opacity", 1);
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
          return d == colName ? data.uiOpts.highlightColor : data.uiOpts.cellColor;
        })
        .style("opacity", function(d, i) {
            return d == colName ? 1 : 0.2;
        });

      // highlight all assignments that use this column
      d3.selectAll(".matrixRow text").classed("active", function(d, i) {
        for(let topic of d.fields[data.columnTitle]) {
          if(topic == colName) return true;
        }
        return false; });

      // make extraneous rows opaque
      d3.selectAll(".matrixRow text").style("opacity", function(d, i) {
        for(let topic of d.fields[data.columnTitle]) {
          if(topic == colName) return 1;
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
          if(topic == d) return true;
        }
        return false; });

      // make extraneous cols opaque
      d3.selectAll(".column text").style("opacity", function(d, i) {
        for(let topic of row.fields[data.columnTitle]) {
          if(topic == d) return 1;
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
      // sort row data on presence of topic
      data.rows = data.rows.sort(function(a, b) {
        return d3.descending(a.fields[data.columnTitle].indexOf(col), b.fields[data.columnTitle].indexOf(col));
      });

      // reseed row names based on new order
      data.rowNames = [];
      for(let i = 0; i < data.rows.length; i++) {
        data.rowNames.push(data.rows[i].fields.title);
      }
      // reset domain of row scale
      rows.domain(data.rowNames);

      // transition rows to new ordering
      var t = svg.transition().duration(1000);
      t.selectAll(".matrixRow")
          .attr("transform", function(d, i) {
            return "translate(0," + rows(d.fields.title) + ")"; });
    }
  }



// fin
  window.matrixVis = {'matrix': matrix, 'bindUI': bindUI, 'categories': collectCategories};
})();
