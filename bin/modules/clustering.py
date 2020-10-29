import numpy as np
from antismash.common import secmet

def get_similarity_scores(nodes, edge_dict):
	edge_dict2 = {}

	for k, v in edge_dict.items():
	    # similarity_score = round(np.mean(v), ndigits=2)
	    max_length = max([nodes[k[i]].number_cluster_members for i in [0, 1]])
	    similarity_score = round(np.mean(v)*len(v)/max_length, ndigits=2)
	    if similarity_score > 5:
	        edge_dict2[k] = similarity_score
	    else:
	        continue

	return edge_dict2


def get_similarity_scores_on_as_object(nodes, edge_dict):

	aggregated_edges = {}

	for k, v in edge_dict.items():
		v = [np.float(sub) for sub in v]
		cds_counts = [get_cds_count(nodes[k[i]]) for i in [0, 1]]
		max_length = max(cds_counts)
		similarity_score = round(np.mean(v)*len(v)/max_length, ndigits=2)
		if similarity_score > 5:
			aggregated_edges[k] = similarity_score

	return aggregated_edges

def get_cds_count(obj):
	if isinstance(obj,secmet.record.Record):
		return len(obj.get_cds_features())
	elif isinstance(obj,secmet.features.protocluster.Protocluster) or isinstance(obj,secmet.features.region.Region):
		return len(obj.cds_children)