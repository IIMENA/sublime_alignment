import {populate_menu, populate_menu_mibig, get_gc_and_product_ids, get_the_nodes, get_links} from "./js_modules/menus.js"
import {network_chart} from "./js_modules/gene-cluster-network.js"
import {get_nodes_of_selection,subset_graph} from "./js_modules/menu_helpers.js"
import {activate_node} from "./js_modules/interactive.js"

function start_network(){

	d3.json("data/results/gene_cluster_by_classes.json").then(function(gc_by_class){
	d3.json("data/results/graph.json").then(function(graph){
	d3.json("data/results/product_search.json").then(function(mibig_products){

	var active_nodes = []; // set this back to empty on every new selection of GC, will be the data array
	var node_store = {};
	var alignment_store = {};

	var gc_lists = get_gc_and_product_ids(gc_by_class);

	populate_menu('#org_selector', Array.from(gc_lists.all_orgs), Array.from(gc_lists.all_orgs).slice(0,2));
	populate_menu('#product_selector', Array.from(gc_lists.all_products), Array.from(gc_lists.all_products)[1]);
	populate_menu_mibig('#mibig_selector', Array.from(mibig_products));

	var plot_nodes = get_nodes_of_selection(graph, gc_by_class);
	var subset_data = subset_graph(graph, plot_nodes, parseInt(d3.select("#edgeCutoff").node().value)); // HERE
	var mibig_suggest_data = mibig_products.filter(d=>Array.from(subset_data.suggest_data).includes(d.bgc_id));
	populate_menu_mibig("#mibig_selector_subset", mibig_suggest_data);

	var network_handle = new network_chart({"graph":graph});
	network_handle.initiate_network();
	network_handle.network_update(subset_data.nodes, subset_data.links);

	d3.select("#edgeCutoff").on("change",function(){
			var edge_cutoff = parseInt(d3.select("#edgeCutoff").node().value);
			d3.select("#edge_cutoff_displayed_value").text(String(edge_cutoff));
			var plot_nodes = get_nodes_of_selection(graph, gc_by_class);
			var subset_data = subset_graph(graph, plot_nodes, edge_cutoff);
			network_handle.network_update(subset_data.nodes, subset_data.links);
		});

    $(".gc_select_widgets").on("change", function(){
	var plot_nodes = get_nodes_of_selection(graph, gc_by_class);
	var subset_data = subset_graph(graph, plot_nodes, parseInt(d3.select("#edgeCutoff").node().value));

	network_handle.network_update(subset_data.nodes, subset_data.links);

	var active_nodes = []; // removes all gene clusters and alignments on new selection
	var node_store = {};
	var alignment_store = {};

	d3.selectAll("#alignment_svg > *").remove();
	d3.selectAll("#controls_svg > *").remove();
	d3.selectAll(".network_circle").attr("state","normal").style("stroke", "black")

    d3.selectAll(".network_circle").on("click", function(d){
		var node_handle = activate_node(d3.select(this), active_nodes, node_store, alignment_store);
		active_nodes = node_handle.active_nodes;
		node_store = node_handle.node_store;
		alignment_store = node_handle.alignment_store;
    });

    });

    d3.selectAll(".network_circle").on("click", function(d){
		var node_handle = activate_node(d3.select(this), active_nodes, node_store, alignment_store);
		active_nodes = node_handle.active_nodes; // node_handle is undefined?
		node_store = node_handle.node_store;
		alignment_store = node_handle.alignment_store;
    });

    $("#color_selector").on("change", function(){
	network_handle.color_nodes($("#color_selector").chosen().val());
    });


	
});
});
});
};

export {start_network};