import {populate_menu, populate_menu_mibig, get_gc_and_product_ids, get_the_nodes, get_links} from "./menus.js"
import {get_mibig_suggestion} from "./mibig.js"


  function convert_chosen_string_to_array(stringlist){
    if (typeof stringlist[0] === "string") {
    stringlist = ((stringlist[0].includes(',')) ? stringlist[0].split(',') : stringlist);
    }
    return stringlist
  };

  function get_nodes_of_selection(graph, gc_by_class){

  var orgs_selected = convert_chosen_string_to_array($('#org_selector').chosen().val());
  var products_selected = convert_chosen_string_to_array($('#product_selector').chosen().val());
  var mibig_bgc_selected = convert_chosen_string_to_array($('#mibig_selector').chosen().val());
  var mibig_subset = convert_chosen_string_to_array($('#mibig_selector_subset').chosen().val());
  var plot_nodes = get_the_nodes(gc_by_class, orgs_selected, products_selected, mibig_bgc_selected, mibig_subset);
  var mibig_nodes = plot_nodes.filter(d => d.includes("BGC")); // Add them at the end...

  var region_or_cluster = convert_chosen_string_to_array($('#region_or_cluster_selector').chosen().val());
  if (region_or_cluster.includes("show_regions") && !region_or_cluster.includes("show_clusters")) {
    plot_nodes = plot_nodes.filter(d => d.includes("_r")) + mibig_nodes;
  } else if (region_or_cluster.includes("show_clusters") && !region_or_cluster.includes("show_regions")){
    plot_nodes = plot_nodes.filter(d => d.includes("_c")) + mibig_nodes;
  } else if (region_or_cluster.includes("show_clusters") && region_or_cluster.includes("show_regions")){
    plot_nodes = plot_nodes;
  } else {
    plot_nodes = [];
  }

  populate_menu("#gene_cluster_highlighter", plot_nodes);
  return plot_nodes;
  };

  function subset_graph(graph, plot_nodes, edge_cutoff){
    var nodes = graph.nodes.filter(d=>plot_nodes.includes(d.id));
    var links = graph.links.filter(d=>get_links(d, plot_nodes, edge_cutoff));
    var suggest_data = get_mibig_suggestion(graph.links, plot_nodes);
    return {"nodes":nodes,"links":links,"suggest_data":suggest_data};
  };

export{subset_graph, get_nodes_of_selection};












