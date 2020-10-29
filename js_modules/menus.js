	function populate_menu(menu_id, array, starting_values=[]){
	for (var i = 0; i < array.length; i++) {
		if (starting_values.includes(array[i])){
			$(menu_id).append('<option value='+array[i]+' selected>'+array[i]+'</option>');}
		else{
			$(menu_id).append('<option value='+array[i]+'>'+array[i]+'</option>');
			}
		}
		// adding all options
		// if that one is chosen I don't want any of the others to be active...
	$(menu_id).append('<option value='+array+'>'+'all'+'</option>');
	$(menu_id).trigger("chosen:updated");
};

function populate_menu_mibig(menu_id, array){
	for (var i = 0; i < array.length; i++) {
			$(menu_id).append('<option value='+array[i].bgc_id+'>'+array[i].product+'</option>');
		}
	$(menu_id).append('<option value='+array.map(d=>d.bgc_id)+'>'+'all'+'</option>');
	$(menu_id).trigger("chosen:updated");
};

function get_gc_and_product_ids(gc_by_class){
	// Taking gene clusters by class and returning unique ids
	// for organisms and products
	var combined_ids = Object.keys(gc_by_class);
	var all_orgs = new Set();
	var all_products = new Set();
		for (var i = 0; i < combined_ids.length; i++) {
		var tmp_node = combined_ids[i];
		all_orgs.add(tmp_node.split(/_(.+)/)[0]);
		all_products.add(tmp_node.split(/_(.+)/)[1]);
		// var split_index = tmp_node.match("_[a-z|A-Z|0-9]+$").index // 
		// all_orgs.add(tmp_node.slice(0,split_index));
		// all_products.add(tmp_node.slice(split_index+1,tmp_node.length));
	}

	return {"all_orgs":all_orgs, "all_products": all_products};
};

function get_the_nodes(gc_by_class, orgs_selected, products_selected, mibig_bgc_selected, mibig_subset){
	// returns nodes that match the organism and products criteria
	// needs to scan mibig_selector as well?
	var all_nodes_to_plot = []
	var gc_keys = Object.keys(gc_by_class);

	for (var i = 0; i < orgs_selected.length; i++) {
		for (var n = 0; n < products_selected.length; n++) {
			var both_selected = orgs_selected[i]+"_"+products_selected[n];
			if (gc_keys.includes(both_selected)) {all_nodes_to_plot.push(gc_by_class[both_selected])}
		}
	}
	var nodes_to_plot =  all_nodes_to_plot.flat().concat(mibig_bgc_selected).concat(mibig_subset); // TODO check if it's a flat array
	return nodes_to_plot;
};

function  get_links(d, plot_nodes, edge_cutoff){
  // after simulation.force("link"), the end points are objects instead of strings
  var source = d.source;
  var target = d.target;
  var edge_val = d.value;
  if (typeof source !== "string") {
    var source = d.source.id;
    var target = d.target.id;
  }
  if(plot_nodes.includes(source) && plot_nodes.includes(target) && edge_val >= edge_cutoff){
    // console.log(typeof d.source);
    return d;
  }
};

export {populate_menu, populate_menu_mibig, get_gc_and_product_ids, get_the_nodes, get_links};