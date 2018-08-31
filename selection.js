(function() {
  /*
    A selection object to keep track of and
     modify a set of current Assignment objects
  */
  window.AssignmentSelection = {
    assignments: {},
    // add an assignment object to the selection
    addAssignment: function(a) {
      this.assignments[a.pk] = a;
      update(this.getAssignments());
    },
    // toggle an assignment in or out of selection
    toggleAssignment: function(a) {
      if(this.assignments[a.pk] === undefined) {
        this.addAssignment(a);
      } else {
        // console.log(a, a.pk, a.fields.title);
        this.removeAssignment(a.pk);
      }
    },
    // remove an assignment (pass object or pk)
    removeAssignment: function(a) {
      if(typeof a === "object")
        a = a.pk;
      delete this.assignments[a];
      update(this.getAssignments());
    },
    // return an array of Assignment objects
    getAssignments: function() {
      return Object.keys(this.assignments).map(e => this.assignments[e]);
    }
  };

  // bind SVG elements to page and style them
  var setup = function() {
    var margin = {top: 25, right: 25, bottom: 25, left: 25},
        width = 500,
        height = 500;

    d3.selectAll("#selectionContainer").remove();
    var svg = d3.select('#middleRow')
                .append('div')
                .attr('class', 'col-md-12')
      .append('div')
        .attr("class", "row")
        .attr("id", "selectionContainer")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-top", "25px");

    svg.selectAll(".currentAssignment")
      .data(AssignmentSelection.getAssignments())
    .enter().append("div")
      .attr("class", "col-md-4 currentAssignment")
      .attr("id", function(d) { return d.pk; })
      .style("margin", "5px")
      .each(buildAssignmentVis);
  };

  // bind all the internal stuff for an assignment div
  var buildAssignmentVis = function(data) {
    let aDiv = d3.select(this);
    aDiv
      .style("border", "solid 1px grey")
      .style("border-radius", "8px");

    let topRow = aDiv.append("div").attr("class", "row"); // top row

    // title
    topRow.append("div").attr("class", "col-md-10")
          .style("font-weight", "bold")
          .style("font-size", "15px")
          .text(data.fields.title);

    // remove button
    topRow
      .append("button").attr("class", "col-md-2 btn btn-danger btn-sm")
          .style("font-weight", "bold")
          .style("max-height", "30px")
          .text("x")
          .on("click", function(d, i) {
            AssignmentSelection.removeAssignment(d.pk);
          });

    let contentRow = aDiv.append("div").attr("class", "row"); // second row for attrs

    // assignment description
    contentRow.append("div").attr("class", "col-md-12")
          .style("max-height", "100px")
          .style("overflow", "scroll")
          .style("margin-bottom", "5px")
          .text(function(d, i) {
            return d.fields.description;
          });

    // courses
    contentRow.append("div").attr("class", "col-md-4")
          .style("font-weight", "bold")
          .text("Courses");
    contentRow.append("div").attr("class", "col-md-8")
          .text(function(d, i) {
            return d.fields.courses.join(", ");
          });

    // languages
    contentRow.append("div").attr("class", "col-md-4")
          .style("font-weight", "bold")
          .text("Languages");
    contentRow.append("div").attr("class", "col-md-8")
          .text(function(d, i) {
            return d.fields.languages.join(", ");
          });

    // topics
    contentRow.append("div").attr("class", "col-md-4")
          .style("font-weight", "bold")
          .text("Tags");
    contentRow.append("div").attr("class", "col-md-8").attr("overflow","scroll")
          .text(function(d, i) {
            return d.fields.topics.join(", ");
          });

    // link to upstream urls (and assignment view?)
    let linkRow = aDiv.append("div")
        .attr("class", "row")
        .style("margin", "auto")
        .style("margin-bottom", "5px");
    linkRow.append("button").attr("class", "btn btn-primary btn-sm")
          .style("font-weight", "bold")
          // .style("margin", "auto")
          .text("Details...")
          .on("click", function(d, i) {
            // console.log(d.fields.upstream_url);
            window.open(d.fields.upstream_url, '_blank');
          });
  };

  // update the selection vis with the current assignment selection
  var update = function() {
    //rejoin data
    var selectedAssignments = d3.select("#selectionContainer").selectAll(".currentAssignment")
        .data(AssignmentSelection.getAssignments(), function(d) {
          return d.fields.title;
        });

    selectedAssignments.exit().transition().duration(500).style("opacity", 0).remove();
    selectedAssignments.enter().append("div")
      .attr("class", "col-md-4 currentAssignment")
      .attr("id", function(d) { return d.pk; })
      .style("opacity", 0)
      .each(buildAssignmentVis)
      .transition().duration(500).style("opacity", 1);

    if(assignmentComparisonVis) assignmentComparisonVis.update();
  };

  window.assignmentSelectionVis = {'setup': setup};
})();
