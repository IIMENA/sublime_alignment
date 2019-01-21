'use strict';

class network_chart{
	constructor(args){
		this.graph = args.graph;
	};
	// Keys for subsettting in DOM
	node_key(d){return d.id;};
	link_key(d){return d.link_key;};

	network_hover_over(d){
		var coordinates = d3.mouse(this);
		d3.select("#network_tooltip")
		.style("left", coordinates[0]+"px")
		.style("top", coordinates[1]+"px")
		.select("#name").text(d.id);
		d3.select("#network_tooltip").select("#family").text(d.family);
		d3.select("#network_tooltip").select("#product").text(d.product);
		d3.select("#network_tooltip").classed("hidden", false);
	};

	network_hover_out(d){
		d3.select("#network_tooltip").classed("hidden", true);
	};

	zoomed(cls) {
		cls.g.attr("transform", d3.event.transform);
	};

	color_nodes(coloring_choice){
		d3.selectAll(".network_circle").style("fill", (d) => {
				let node_color = "black";
				if (coloring_choice=="family") {
					node_color = this.color(d.family);
				} else if (coloring_choice=="mibig"){
					node_color = this.color(d.mibig);
				} else if (coloring_choice=="product_class"){
					node_color = this.color(d.product);
				} else if (coloring_choice=="species"){
					node_color = "grey";
					if (!d.id.includes("BGC")) {
						node_color = this.color(d.id.slice(0, d.id.match("_[a-z|A-Z|0-9]+$").index));
					} else {
						node_color = "grey"};

				}
				return node_color;

		});
	};


	initiate_network(){
		// First function to call to set up the network
		this.color = d3.scaleOrdinal(d3.schemeCategory10);
		this.network_svg = d3.select("#network");
		this.g = this.network_svg.append("g")
							.attr("class", "network_group");
		this.link = this.g.append("g").attr("stroke", "#000").attr("stroke-width", 1.5).selectAll(".link");
		this.node = this.g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");
		this.simulation;
		// console.log(this.link)

	}




	network_update(nodes, links){
		console.log(nodes);
		console.log(links);
		this.nodes = nodes;
		this.links = links;

		this.simulation = d3.forceSimulation()
				    .force("link", d3.forceLink().id(function(d) {
				    	// console.log("d inside simulation")
				    	// console.log(d);
				    	return d.id; }))
				    .force("charge", d3.forceManyBody().strength(-100))
				    .force("center", d3.forceCenter(400 / 2, 400 / 2))
				    .force("forceX", d3.forceX())
				    .force("forceY", d3.forceY());

		this.node = this.node.data(this.nodes, this.node_key);

		this.node.exit().transition()
				.attr("r", 0)
				.remove();

		this.node = this.node.enter()
				.append("circle")
				.attr("class", "network_circle")
				.attr("stroke-width", 5)
				.attr("stroke", function(d){if (d.id.includes("BGC")) {return "orange"} else {return "black"}}) 
				.attr("r", function(d){
					if (d.id.includes("BGC")) {return 15;} else {return 10;}})
				.on("mouseover",this.network_hover_over)
				.on("mouseout",this.network_hover_out)
				.merge(this.node);

		//LINKS
		this.link = this.link.data(this.links, this.link_key);

		this.link.exit().transition()
		.attr("stroke-opacity", 0)
		.attrTween("x1", function(d) { return function() { return d.source.x; }; })
		.attrTween("x2", function(d) { return function() { return d.target.x; }; })
		.attrTween("y1", function(d) { return function() { return d.source.y; }; })
		.attrTween("y2", function(d) { return function() { return d.target.y; }; })
		.remove();

		this.link = this.link.enter().append("line").merge(this.link);

		this.link.on("mouseover", function(d){
			d3.select("#current_edge_value").text(String(d.value));
		});

		this.simulation.nodes(this.nodes).on("tick", () => {
			this.link
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

			this.node
			.attr("cx", function(d) {
			return d.x; })
			.attr("cy", function(d) {
			return d.y; });
		});
		this.simulation.force("link").links(this.links); // this one gives problems. It alters the graph object?
		this.simulation.force("forceX").strength(.05);
		this.simulation.force("forceY").strength(.05);
		this.simulation.alpha(1).restart();

		this.network_svg.call(d3.zoom()
			.scaleExtent([1, 8])
			.on("zoom", () => this.zoomed(this)));

		var zoom_handler = d3.zoom()
		    .on("zoom", () => this.zoomed(this));

		zoom_handler(this.network_svg); 
	};

};


export{network_chart};
