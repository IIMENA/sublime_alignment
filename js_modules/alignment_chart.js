function draw_alignment(dat, parent_element, x_scale, y_scale, options, t) {



	// options include: alignment_options, bgc_data, pident
		console.log("Redrawing alignment")
		var current_alignment_data = dat.get_alignment_plot_array(options);

		current_alignment_data = current_alignment_data.filter(d=>d.pident>=options.alignment_cutoff);

		var alignments = parent_element.selectAll("path")
						.data(current_alignment_data, alignment_key);


		var alignments_enter = alignments.enter().append("path")
			.attr("class", "enter");

		var alignments_exit = alignments.exit()
		.attr("class", "exit")
		.transition(t)
		.style("fill", "red")
		.style("fill-opacity", 1e-6)
		.remove();


		var alignments = alignments.merge(alignments_enter)
						.attr("d", d=> path_coordinates(d, x_scale, y_scale, dat.order))
						.attr("tx", d => d.tx = x_scale(d.from.plot_start)) // for tooltips 
					    .attr("ty", d => d.ty=y_scale(d.from.name)) // for tooltips
						.on("mouseover", alignment_mouseover)
						.attr("class", "update")
						.style("fill-opacity", d=> alignment_fill_opacity_function(d, options))
						.style("fill", d=> alignment_fill_function(d, options))
						.on("mouseout", alignment_mouseout);

		};

  var alignment_key = function(d){
    return d.combined_tag
  };

function alignment_fill_opacity_function(d, options){

				if (options.gene_highlight == d.from.tag){
					return 0.8;
				}
				else if  (options.focus) {
					return 0.1;
				}				else {
					return 0.8;
				}
			};


function alignment_fill_function(d, options){

				if (options.gene_highlight == d.from.tag){
					return "red"
				} 
				else if (options.focus) {
					return "grey";
				}else {
				 	return "skyblue";
				 }
			};

function alignment_mouseover(d){
	var xvar = (d.tx + 16);
	var yvar = (d.ty + 16);
	// var xvar = (parseFloat(d3.event.pageX) + 16); // old styling, only works properly when tooltips are displayed relative to page
	// var yvar = (parseFloat(d3.event.pageY) + 16);

 	d3.select("#alignment_tooltip")
 	.style("left", xvar+"px")
	.style("top", yvar+"px");

 	d3.select("#alignment_tooltip").select("#alignment_from_start").text(d.from.plot_start);
 	d3.select("#alignment_tooltip").select("#alignment_from_name").text(d.from.cds);
 	d3.select("#alignment_tooltip").select("#alignment_from_end").text(d.from.plot_end);
 	d3.select("#alignment_tooltip").select("#alignment_to_name").text(d.to.cds);
 	d3.select("#alignment_tooltip").select("#alignment_to_start").text(d.to.plot_start);
 	d3.select("#alignment_tooltip").select("#alignment_to_end").text(d.to.plot_end);
 	d3.select("#alignment_tooltip").select("#alignment_pident").text(d.pident);

    d3.select("#alignment_tooltip").classed("hidden", false);

	};


function alignment_mouseout(d){
	d3.select("#alignment_tooltip").classed("hidden", true);
	};



function path_coordinates(d, x_scale, y_scale, domainList){
	var from_padding = 0;
	var to_padding = 0;

	var from_index = domainList.findIndex(gc => gc === d.from.name);
	var to_index = domainList.findIndex(gc => gc === d.to.name);

if (from_index < to_index) {
	from_padding = 20;
	to_padding = 0} else {
	from_padding = 0;
	to_padding = 20;
	}


	  var first = x_scale(d.from.plot_start)+","+(from_padding+y_scale(d.from.name));
	  var second = x_scale(d.to.plot_start)+","+(to_padding+y_scale(d.to.name));
	  var third = x_scale(d.to.plot_end)+","+(to_padding+y_scale(d.to.name));
	  var fourth = x_scale(d.from.plot_end)+","+(from_padding+y_scale(d.from.name));


	  var combined = "M"+first+" "+second+" "+third+" "+fourth+"z";


	  return combined;
}



export {draw_alignment}