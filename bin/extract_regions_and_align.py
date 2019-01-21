import os
import json
import csv
import sys
import glob
from timeit import default_timer as timer
from Bio import SeqIO
import pandas as pd
import networkx as nx
import community as com
from collections import defaultdict
from antismash.common.subprocessing import parallel_function
from antismash.common.secmet import Record
from modules.cds_parser import format_tracks
from modules.blastparser import get_alignment_location_on_parent
from modules.clustering import get_similarity_scores_on_as_object
from antismash.common import secmet

def from_genbank_special(filepath):
    try:
        return (filepath, Record.from_genbank(filepath, "bacteria"))
        # return {"Name":arg.split("/")[-1].replace(".gbk", ""),"secmet_records": Record.from_genbank(arg, "bacteria")}
    except Exception as e:
        print(e)

threads = sys.argv[3]
output_dir = sys.argv[4]

# If output dir does not exist, create it
if not os.path.exists(output_dir):
    print("Outdir does not exist, creating dir %s" % output_dir)
    os.makedirs(output_dir)

genome_file_paths = glob.glob(sys.argv[1])
print("Genome files")
print(genome_file_paths)
mibig_file_paths = glob.glob(sys.argv[2])
print("Mibig files")
print(mibig_file_paths)

start = timer()


records = parallel_function(from_genbank_special, [[i] for i in genome_file_paths], cpus=int(threads))
print("Genome files in  %d" % (timer() - start))
records.extend(parallel_function(from_genbank_special, [[i] for i in mibig_file_paths], cpus=int(threads)))

end = timer()
print("Time used for parallelized file loading: " + str(end-start))


cds_lookup = defaultdict(list)
fasta_sequences = [] # only needs to be set in regions and MIBIG BGC, not in clusters (No redundancy)

regions_clusters_mibig = defaultdict(list)
regions_clusters_mibig_records = {}

for filepath, rec in records:
    instance_name = filepath.split("/")[-1].replace(".gbk","")

    for contig in rec:
        if instance_name.startswith("BGC"):
            format_tracks(regions_clusters_mibig, regions_clusters_mibig_records, contig, contig, instance_name, cds_lookup, fasta_handle = fasta_sequences)
        else:
            for region in contig.get_regions():
                format_tracks(regions_clusters_mibig, regions_clusters_mibig_records, region, contig, instance_name, cds_lookup, fasta_handle = fasta_sequences)
                for cluster in region.get_unique_clusters():
                    format_tracks(regions_clusters_mibig, regions_clusters_mibig_records, cluster, contig, instance_name, cds_lookup)

with open(output_dir+"all.fasta", "w") as fa_handle:
    SeqIO.write(fasta_sequences, fa_handle, format="fasta")

# Alignment of sequences
os.system("diamond makedb --in %sall.fasta -d %sall --threads %s" % (output_dir, output_dir, threads))
os.system("diamond blastp -q %sall.fasta -d %sall  -o %sall.m8 --threads %s --query-cover 50 --subject-cover 50 -f 6 qseqid sseqid qstart qend qlen sstart send slen evalue bitscore score length pident mismatch gapopen" % (output_dir, output_dir, output_dir, threads))


# Reading blast file, need to convert the protein positions to DNA
blast = []
alignment_fields = ["qseqid", "sseqid", "qstart", "qend", "qlen", "sstart", "send", "slen", "evalue", "bitscore", "score", "length", "pident", "mismatch", "gapopen"]
with open(output_dir+"all.m8") as blast_handle:
    csv_handle = csv.reader(blast_handle, delimiter="\t")
    for line in csv_handle:
        tmp_blast = dict(zip(alignment_fields, line))
        if tmp_blast["qseqid"] != tmp_blast["sseqid"]:
            blast.append(tmp_blast)

# Creating a json file with alignments
alignment_json = defaultdict(list)
edge_dict = defaultdict(list)
for alignment in blast:
    for query_parent in cds_lookup[alignment["qseqid"]]:
        query_alignment = get_alignment_location_on_parent(alignment, query_parent["contig"], query_parent["parent"], "query")
        for subject_parent in cds_lookup[alignment["sseqid"]]:
            subject_alignment = get_alignment_location_on_parent(alignment, subject_parent["contig"], subject_parent["parent"], "subject")

            edge_dict[(query_parent["parent_id"],subject_parent["parent_id"])].append(alignment["pident"])

            alignment_json[query_parent["parent_id"]].append({"from":{
                                                                    "name": query_parent["parent_id"],
                                                                    "cds": alignment["qseqid"].split("_",1)[1],
                                                                    "tag": query_parent["parent_id"]+"_"+alignment["qseqid"].split("_",1)[1],
                                                                    "start": query_alignment.start,
                                                                    "end": query_alignment.end},
                                                                "to": {
                                                                    "name": subject_parent["parent_id"],
                                                                    "cds": alignment["sseqid"].split("_",1)[1],
                                                                    "tag": subject_parent["parent_id"]+"_"+alignment["sseqid"].split("_",1)[1],
                                                                    "start": subject_alignment.start,
                                                                    "end": subject_alignment.end},
                                                                    "pident": alignment["pident"]})


def write_json_data(dir_name, def_dict):
    for k,v in def_dict.items():
        tmp_dir = dir_name + k.split("_",1)[0]
        if not os.path.exists(tmp_dir):
            os.makedirs(tmp_dir)

        with open(tmp_dir+"/%s.json" % k, "w") as json_handle:
            json.dump(v, json_handle, separators=(',',':'))

def determine_mibig_name(name):
    if "BGC" in name:
        return "mibig"
    else:
        return "strain"

def get_product_from_region_or_cluster(roc):
    if isinstance(roc,secmet.features.region.Region):
        return roc.get_product_string()
    else:
        return roc.product

write_json_data(output_dir+"gene_clusters/", regions_clusters_mibig)
write_json_data(output_dir+"alignments/", alignment_json)

aggregated_edges = get_similarity_scores_on_as_object(regions_clusters_mibig_records, edge_dict)

print("networking part")
g = nx.Graph()
df = pd.DataFrame([(k[0], k[1], v) for k, v in aggregated_edges.items()], columns=['source','target','value'])
g.add_weighted_edges_from(df.values)
clustering = com.best_partition(g)
print("Done")



nodes_for_network = []
product_to_node = defaultdict(list)
product_to_mibig = []
for node, node_rec in regions_clusters_mibig_records.items():
    tmp_group = clustering.get(node) # singleton get group else singleton
    if not tmp_group:
        tmp_group = "singleton"
    if "BGC" not in node:
        tmp_product = get_product_from_region_or_cluster(node_rec)
        nodes_for_network.append({"id": node, "family": tmp_group, "mibig": determine_mibig_name(node), "product": tmp_product})
        product_to_node[node.split("_",1)[0]+"_"+tmp_product].append(node)
    else:
        product_to_mibig.append({"product": node_rec.description.replace("biosynthetic gene cluster", "BGC")+"("+node+")", "bgc_id": node})
        nodes_for_network.append({"id": node, "family": tmp_group, "mibig": determine_mibig_name(node)})

edges_for_network = [{"source": k[0], "target":k[1], "value":v, "link_key":k[0]+"_"+k[1]} for k,v in aggregated_edges.items()]

graph_for_network = {"nodes":nodes_for_network, "links":edges_for_network}

with open(output_dir+'graph.json', 'w') as filehandle:
    json.dump(graph_for_network, filehandle, separators=(',',':'))

# Strictly not only gene clusters but also regions

with open(output_dir+"gene_cluster_by_classes.json", "w") as json_handle:
    json.dump(product_to_node, json_handle, separators=(',',':'))

with open(output_dir+'product_search.json', 'w') as filehandle:
    json.dump(product_to_mibig, filehandle, separators=(',',':'))

