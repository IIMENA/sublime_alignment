import {Alignment} from './alignment.js'
import {Bgc} from './bgc.js'

class AlignmentData{
	// Main object for gene cluster and alignment data
	// Needs json formatted gene cluster data and alignment data as input

	constructor(gene_cluster_data, alignment_data){
		this.clusters = this.initiate_clusters(gene_cluster_data);
		this.order = this.get_cluster_names_for_initial_order();
		this.alignment_data = this.format_alignment_data(alignment_data); // add some counter and full tag id on the whole array, this.combined_tag = args.from.name+"_"+args.to.name+"_"+counter
	}

	initiate_clusters(gene_cluster_data){
		// should make bgc objects already
		// needs active, reverse, cluster_length
		// check if cluster is not in mibig list, if so, set active //not implemented yet, just set all active
		var gc = {};
		for (var i = 0; i < gene_cluster_data.length; i++) {
			gc[gene_cluster_data[i].Name] = new Bgc(gene_cluster_data[i]);
		}
		return gc

	}

	reverse(gc_id){
		console.log("reversing cluster "+gc_id)
		this.clusters[gc_id].reverse();
		// from
		// console.log("Before")
		// console.log(this.alignment_data);
		var froms = Object.values(this.alignment_data);

		for (var i = 0; i < froms.length; i++) {
			var tos = Object.values(froms[i]);
			for (var n = 0; n < tos.length; n++) {
				tos[n].map(d=> d.reverse(this.clusters[gc_id]));
			}
		}

		// console.log(this.alignment_data)
		
	}

	get_cluster_names_for_initial_order(){
		// gets active clusters directly as array..
		var all_names = Object.values(this.clusters).map(d=>d.name);
		return all_names
	}

	get_active_clusters_in_order(){
		// gets active clusters directly as array...
		let cluster_array = [];
		// console.log(this.order)
		for (var i = 0; i < this.order.length; i++) {
			let cluster = this.clusters[this.order[i]];
			if (cluster.active) {cluster_array.push(cluster)}
		}
		return cluster_array
		// return Object.values(this.clusters).filter(d=>d.active==true)
	}

	get_cluster_plot_array(){
		return this.get_active_clusters_in_order().map(d=>d.get_bgc_for_plot());
	}

	get_alignment_plot_array(options){
// options.cutoff needs to be 
		var alignment_plot_array = [];
		if (options.cutoff) {
			var local_cutoff = options.cutoff;
		}else{
			var local_cutoff = 0;
		}
		if (options.bgc_data==null) {
		var active_alignments = this.get_active_alignments_in_order();
		} else {
		var active_alignments = this.get_active_alignments_with_focus(options.bgc_data);
		}
		console.log("Active alignments")
		console.log(active_alignments);

		for (var i = 0; i < active_alignments.length; i++) {
			for (var n = 0; n < active_alignments[i].length; n++) {
				var tmp = active_alignments[i][n].get_plot_data();
				if(tmp.pident > local_cutoff){
				alignment_plot_array.push(tmp)
				}
			}
		}



		return alignment_plot_array
	}


	format_alignment_data(alignment_data){

		var all_alignments = {};

		for (var i = 0; i < alignment_data.length; i++) {
			var tmp_alignment = new Alignment(alignment_data[i]);

			if (!Object.keys(all_alignments).includes(tmp_alignment.from.name)) {
				all_alignments[tmp_alignment.from.name] = {};
			}

			if (!Object.keys(all_alignments[tmp_alignment.from.name]).includes(tmp_alignment.to.name)) {
				all_alignments[tmp_alignment.from.name][tmp_alignment.to.name] = [];
			}

			all_alignments[tmp_alignment.from.name][tmp_alignment.to.name].push(tmp_alignment);

		}

		return all_alignments
	}


get_active_alignments_in_order(){

		var active_names = this.get_active_clusters_in_order().map(d=>d.name);
		var plot_alignments = [];

		for (var i = 0; i < active_names.length-1; i++){
			var tmp = this.alignment_data[active_names[i]][active_names[i+1]];
			if (typeof tmp != 'undefined') {plot_alignments.push(tmp)}
			
		}


		return plot_alignments
}

get_active_alignments_with_focus(bgc){

		var active_names = this.get_active_clusters_in_order().map(d=>d.name);
		var plot_alignments = [];
		var tmp = this.alignment_data[bgc.origin];

		var filtered_names = active_names.filter(d=>d!=bgc.origin);
		for (var i = 0; i < filtered_names.length; i++){
			var res = tmp[filtered_names[i]];
			if (typeof res != 'undefined') {plot_alignments.push(res)}
			
		}


		return plot_alignments
}

}



export {AlignmentData};

		// OPTIONS: focus_bgc to highlight all connections of one bgc only
		// ordered bgc array show up down from to order		
		// actions: Subset, and if necessary reverse

		// takes alignment data and returns array with points?
		//  would need x_scale and y_scale
		// TODO needs to be rewritten in python as well
		// {
  //       "from": "BGC0000684.1.cluster001",
  //       "from_cds": "Mt11",
  //       "from_tag": "BGC0000684.1.cluster001_Mt11",
  //       "to": "BGC0000156.1.cluster001",
  //       "to_cds": "Mt12",
  //       "to_tag": "BGC0000156.1.cluster001_Mt12",
  //       "from_start": 5912,
  //       "to_start": 4639,
  //       "pident": 62,
  //       "from_end": 7160,
  //       "to_end": 5854
  //   }

//   function subset_alignment(alignment_data, domainList){
//   // creates order and subsets data