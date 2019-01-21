import {gene_cluster_alignment_chart} from "./gc_alignment_oop.js"
import {AlignmentData} from './gc_object.js'

var gc_alignment_handle = new gene_cluster_alignment_chart();
gc_alignment_handle.initiate_chart();

function activate_node(selected_circle, active_nodes, node_store, alignment_store){
    if (selected_circle.attr("state")=="selected") {
    selected_circle.attr("state", "normal");
    let tmp_node = selected_circle.datum().id;
    selected_circle.style("stroke", "black");
    active_nodes = active_nodes.filter(d => d!=tmp_node);
    delete node_store[tmp_node];
    delete alignment_store[tmp_node];
    var dat = new AlignmentData(Object.values(node_store).flat(), Object.values(alignment_store).flat());
    gc_alignment_handle.update(dat);


  } else {
    selected_circle.attr("state", "selected");
    let tmp_node = selected_circle.datum().id;
    selected_circle.style("stroke", "green");
    active_nodes.push(tmp_node);

    var node_dir = "test_data/gene_clusters/"+get_node_org_id(tmp_node)+"/"+tmp_node+".json";
    d3.json(node_dir).then(function(tmp_node_data){
    d3.json("test_data/alignments/"+get_node_org_id(tmp_node)+"/"+tmp_node+".json").then(function(tmp_alignment_data){
        node_store[tmp_node] = tmp_node_data;
        alignment_store[tmp_node] = tmp_alignment_data;
        var dat = new AlignmentData(Object.values(node_store).flat(), Object.values(alignment_store).flat());
        gc_alignment_handle.update(dat);
    });
  });
};
  return {"active_nodes":active_nodes, "node_store": node_store, "alignment_store": alignment_store};
};
function get_node_org_id(node_id){
    // returns the first characters describing the organism (i.e. everything until the first underscore)
    // return node_id.slice(0, node_id.match("_c[0-9]{1,2}$").index)
    return node_id.split(/_(.+)/)[0];
};

export {activate_node};

// d3.json("output/gene_cluster_by_classes.json").then(function(gc_by_class){};