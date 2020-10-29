import {draw_alignment} from './alignment_chart.js'
import {draw_gene_cluster_tracks, Track_key} from './gene_cluster_tracks.js'

function draw_controls(dat, controls_svg, y_scale, t){

var track_level_only = dat.get_active_clusters_in_order().map(d=>d.get_bgc_for_plot()).map(d=>d.Track);


var flippers = controls_svg.selectAll(".selector_circle")
							.data(track_level_only, Track_key)

      var flippers_enter = flippers.enter()
      .append("circle")
      .attr("class", "selector_circle")
      .attr("orientation", "normal");


      flippers.exit().remove();

      var flippers = flippers.merge(flippers_enter)

      flippers.attr("cx", 0 +10+2) // circle diameter + padding
      .attr("cy", function(d){
        return d.cy = y_scale(d.Name)+10;
      })
      .attr("tx", d => d.tx = 0+10+2) // for tooltips
      .attr("ty", d => d.ty = y_scale(d.Name)) // for tooltips
      .style("r", 10)
      .style("fill", "teal")
      .style("stroke", "black")
      .style("stroke-width", "2px")
      .on("mouseover", selector_mouseover)
      .on("mouseout", selector_mouseout);

};

function selector_mouseover(d){
  var xvar = (d.tx + 16);
  var yvar = (d.ty + 16);
	// var xvar = (parseFloat(d3.event.pageX) + 16);
	// var yvar = (parseFloat(d3.event.pageY) + 16);

 	d3.select("#selector_tooltip")
 	.style("left", xvar+"px")
	.style("top", yvar+"px")
 	.select("#origin")
        .text(d.Name);

    d3.select("#selector_tooltip").classed("hidden", false);

};


function selector_mouseout(d){
	d3.select("#selector_tooltip").classed("hidden", true);
};

export {draw_controls};