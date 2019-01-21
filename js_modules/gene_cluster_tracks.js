function draw_gene_cluster_tracks(dat, svg, x_scale, y_scale, t){

// update pattern, ref https://bl.ocks.org/cmgiven/32d4c53f19aea6e528faf10bfe4f3da9,https://bl.ocks.org/mbostock/3808234
  console.log("Redrawing gene cluster polygons");
    var groups = svg.selectAll("g")
          .data(dat.get_active_clusters_in_order().map(d=>d.get_bgc_for_plot()), group_key)

    var groups_enter = groups.enter()
          .append("g");

    var groups_exit = groups.exit().remove();

    var groups = groups.merge(groups_enter)
              .attr("class", "update");


  var Tracks = groups.selectAll("rect")
            .data(function(d) {
              return [d.Track];}, Track_key)

        var Tracks_enter = Tracks.enter()
            .append("rect")
            .attr("class", "enter");

            Tracks.exit()
            .attr("class", "exit")
            .transition(t)
            .style("fill", "red")
            .style("fill-opacity", 1e-6)
            .remove();

        var Tracks = Tracks.merge(Tracks_enter).attr("class", "update")
            .attr("x", function(d){
              return x_scale(0)
            })
            .attr("y", function(d) {
              return y_scale(d.Name);
            })
            .style("width", function(d) {
              return x_scale(d.Length)+"px";
            })
            .style("height", "20px")
            .style("fill","grey")
            .style("fill-opacity", 0.3)
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .style("stroke-opacity", 0.3);


  var genes = groups.selectAll("polygon")
          // .data(function(d){console.log(d.CDSs);})
          .data(function(d){return d.CDSs;})

    var genes_enter = genes.enter()
                .append("polygon")
                .attr("class","enter");

    genes.exit()
    .attr("class", "exit")
    .transition(t)
    .style("fill", "red")
    .style("fill-opacity", 1e-6)
    .remove();

    genes.merge(genes_enter).attr("class", "update")
      .style("fill-opacity", 1)
      .style("fill", "teal")
      .attr("points", function(d){return gene_polygon(d, x_scale, y_scale, 20)})
      .attr("tx", d => d.tx = x_scale(d.display_end)) // for tooltips
      .attr("ty", d => d.ty=y_scale(d.origin)) // for tooltips
      // .on("click", focus_alignment_combined)
      .on("mouseover", gene_mouseover)
      .on("mouseout", gene_mouseout)
      .style("fill", "teal")
      .style("stroke", "black")
      .style("stroke-width", "2px");
};

var Track_key = function(d){
return d.Name
};

var group_key = function(d){
return d.Name
};

function gene_polygon(cds, x_scale, y_scale, arrowheight, y=null){
// reversed_clusters was in argument list
// console.log(cds)

  var start = x_scale(cds.display_start);
  var end = x_scale(cds.display_end);
  if (!y) {var height = y_scale(cds.origin);}else{var height = y;}
  var low_res = (end-start) < 15 // width in pixels
  // var low_res = false;

  if (cds.display_strand == 1) {

    var first = start+","+height;
    var second = (end-10)+","+height;
    var third = end+","+(height+arrowheight/2);
    var fourth = (end-10)+","+(height+arrowheight);
    var fifth = start+","+(height+arrowheight);

    if (low_res) {
      var pol = first+" "+third+" "+fifth;
      // var pol = first+" "+second+" "+fourth+" "+fifth;
    } else {
      var pol = first+" "+second+" "+third+" "+fourth+" "+fifth;
    }

  } else {
    var first = (start+10)+","+height;
    var second = end+","+height;
    var third = end+","+(height+arrowheight);
    var fourth = (start+10)+","+(height+arrowheight);
    var fifth = start+","+(height+arrowheight/2);

    if (low_res) {
      var pol = fifth+" "+second+" "+third;
      // var pol = second+" "+third+" "+fourth; this does not work
      // var pol = first+" "+second+" "+third+" "+fourth;
    } else {
      var pol = first+" "+second+" "+third+" "+fourth+" "+fifth;
    }
  }


  return pol
}

function gene_mouseover(d){
  console.log("showing gene tooltip")
  console.log(d)
  var xvar = (d.tx + 16);
  var yvar = (d.ty + 16);
  // var xvar = (parseFloat(d3.event.x) + 16);
  // var yvar = (parseFloat(d3.event.y) + 16);

  console.log("Coordinates")
  console.log(xvar)
  console.log(yvar)

  d3.select("#gene_tooltip")
  .style("left", xvar+"px")
  .style("top", yvar+"px")
  .select("#name").text(d.tag);
  d3.select("#gene_tooltip").select("#cds_start").text(d.display_start);
  d3.select("#gene_tooltip").select("#cds_gene").text(d.gene);
  d3.select("#gene_tooltip").select("#cds_end").text(d.display_end);
  d3.select("#gene_tooltip").select("#cds_locus_tag").text(d.locus_tag);
  d3.select("#gene_tooltip").select("#cds_product").text(d.product);
  console.log(d);


    d3.select("#gene_tooltip").classed("hidden", false);

}


function gene_mouseout(d){
  d3.select("#gene_tooltip").classed("hidden", true);
}

export {draw_gene_cluster_tracks, Track_key};