(function() {
  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

  var margin = {top: 25, right: 25, bottom: 25, left: 25},
      width = 1000,
      height = 1000;

  var nodes;// = [];
  var links;// = [];
  var node;// = d3.select("#comparisonGroup").selectAll(".assignmentNode");
  var link;

  var simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links)
        .id(function(d) { return d.id; })
        .distance(function(d) {
            return 1/Math.log(d.distance.weight+1) * 200;
        }))
    .force("charge", d3.forceManyBody()
        .strength(-75)
        .distanceMax([250]))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
      return d.r;
    }))
    .on("tick", ticked);

  function ticked() {
    if(!node || !link) return;
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  // bind SVG elements to page and style them
  var setup = function() {
    // var margin = {top: 25, right: 25, bottom: 25, left: 25},
    //     width = 500,
    //     height = 500;

    d3.selectAll("#comparisonContainer").remove();
    d3.select('#bottomRow')
                  .append('div')
                  .attr('class', 'col-md-12')
      .append('div')
        .attr("id", "comparisonContainer")
        .style("border", "solid 5px grey");
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        // .style("margin-top", "25px");

    var svg = d3.select("#comparisonContainer")
      .append('svg')
        .attr("id", "comparisonSVG")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-top", "25px")
      .append("g")
        .attr("id", "comparisonGroup")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    nodes = [];
    links = [];
    node = d3.select("#comparisonGroup").selectAll(".assignmentNode");
    link = d3.select("#comparisonGroup").selectAll(".assignmentLink");
  };

  var computeDistance = function(n1, n2) {
    // let weCareAboutThese = ["authors", "course", "topics", "languages", "classifications"],
    let weCareAboutThese = ["classifications"],
        sum = 0, // sum of all properties in both objects
        shared = 0, // sum of shared properties
        all = {},
        inCommon = [];

    // examine each category
    for(let category of weCareAboutThese) {
      for(let a in n1.fields[category]) {
        let name = n1.fields[category][a];
        if(!all[name]) {
          all[name] = 1;
        } else {
          all[name]++;
        }
      }
      for(let a in n2.fields[category]) {
        let name = n2.fields[category][a];
        if(!all[name]) {
          all[name] = 1;
        } else {
          all[name]++;
        }
      }
    }

    for (let prop in all) {
      if (all.hasOwnProperty(prop)) {
        sum++;
        if(all[prop] > 1) {
          inCommon.push(prop);
          shared++;
        }
      }
    }

    return {'weight': shared, 'inCommon': inCommon};
  };

  var collectLinks = function(nodes) {
    links = [];
    if(nodes.length > 1) {
      for (var i = 0; i < nodes.length - 1; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          l = {
              "source": nodes[i],
              "target": nodes[j],
              "distance": computeDistance(nodes[i], nodes[j])
            };
          if(l.distance.weight !== 0)
            links.push(l);
        }
      }
    }
    return links;
  };


  // update the selection vis with the current assignment selection
  var update = function() {

    nodes = AssignmentSelection.getAssignments();

    node = node.data(nodes, function(d) { return d.pk; });

    node.exit().transition().duration(500).style("opacity", 0).remove();
    node.exit().remove();
    node = node.enter().append("circle")
      .attr("class", "assignmentNode")
      .attr("id", function(d) { return d.pk; })
      // .style("opacity", 0)
      // .transition().duration(500).style("opacity", 1)
      .attr("r", 10)
      .attr("fill", function(d) { return "white"; })
      .attr("stroke", function(d) { return "purple"; })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
      .on("click", function(d, i) {
        console.log(d);
        d.fx = null;
        d.fy = null;
      })
      .on('mouseover', function(d, i) {
        d3.select("#tooltip").transition()
                .duration(200)
                .style("opacity", 0.9);
        d3.select("#tooltip").text(d.fields.title)
                .style("left", (d3.event.pageX + 25) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
        d3.select("#tooltip").moveToFront();
      })
      .on('mouseout', function(d, i) {
        d3.select("#tooltip").transition()
                .duration(200)
                .style("opacity", 0);
      })
      .merge(node);
    node
    .append("svg:title")
     .text(function(d) { return d.fields.title; });

    links = collectLinks(AssignmentSelection.getAssignments());

    // Apply the general update pattern to the links.
    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
    link.exit().transition().duration(500).style("opacity", 0).remove();
    link = link.enter().append("line")
      .style("stroke", "black")
      .style("stroke-width", function(d) {
        return Math.log(d.distance.weight+1);
      })
      .on('mouseover', function(d, i) {
        d3.select("#tooltip").transition()
                .duration(200)
                .style("opacity", 0.9);
        d3.select("#tooltip").html(d.distance.inCommon.join("<br />"))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        d3.select("#tooltip").moveToFront();

      })
      .on('mouseout', function(d, i) {
        d3.select("#tooltip").transition()
                .duration(200)
                .style("opacity", 0);
      })
      .merge(link);

     simulation
         .nodes(nodes);

     simulation.force("link")
         .links(links);

         d3.selectAll(".assignmentNode").moveToFront();

     simulation.alpha(1).restart();

     function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

  };

  window.assignmentComparisonVis = {'setup': setup, 'update': update};
})();
