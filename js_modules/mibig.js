function get_mibig_suggestion(array, plot_nodes){
	// Returning BGC (MIBIG) suggestions from a graph object
	// after simulation.force("link"), the end points are objects instead of strings
	// cannot work because BGC are not inside links, needs to be exactly like get
	// ONLY SHOW hits from normal gene clusters to BGC
	var all_suggestions = new Set();

	for (var i = 0; i < array.length; i++) {
		var d = array[i];
		
	var source = d.source;
	var target = d.target;
	if (typeof source !== "string") {
		var source = d.source.id;
		var target = d.target.id;
	}
	if(plot_nodes.includes(source) ){
		if (!source.includes("BGC") && target.includes("BGC")) {
			all_suggestions.add(target);
		}
		if (!target.includes("BGC") && source.includes("BGC")) {
			all_suggestions.add(source);
		}
	}
	}
	return all_suggestions
};

export {get_mibig_suggestion};