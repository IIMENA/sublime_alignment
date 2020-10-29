from Bio.SeqRecord import SeqRecord
from Bio.Seq import Seq
from antismash.common import secmet

def format_tracks(store, regions_clusters_mibig_records, parent, contig, inst_id, cds_lookup, fasta_handle=None):

    cds_json = []

    if isinstance(parent,secmet.features.region.Region):
        parent_id = inst_id+"_r"+str(parent.get_region_number())
        cdss = parent.cds_children
        parent_length = parent.location.end - parent.location.start
    elif isinstance(parent,secmet.features.protocluster.Protocluster):
        parent_id = inst_id+"_c"+str(parent.get_protocluster_number())
        cdss = parent.cds_children
        parent_length = parent.location.end - parent.location.start
    elif isinstance(parent,secmet.record.Record):
        parent_id = inst_id
        cdss = parent.get_cds_features()
        parent_length = contig.__len__()
    else:
        print("No valid record")


    regions_clusters_mibig_records[parent_id] = parent
    
    for cds in cdss:
        unique_cds_id = inst_id+"_"+cds.get_name()
        cds_lookup[unique_cds_id].append({"parent":parent, "contig":contig, "parent_id":parent_id, "instance_id":inst_id})
        
        if fasta_handle is not None and (isinstance(parent,secmet.features.region.Region) or isinstance(parent,secmet.record.Record)):
            fasta_handle.append(SeqRecord(Seq(cds.translation), id=unique_cds_id))

        if hasattr(parent,"location"):
            new_location_start = cds.location.start-parent.location.start
            new_location_end = cds.location.end-parent.location.start
        else:
            new_location_start = cds.location.start
            new_location_end = cds.location.end

        cds_json.append({
        "origin": parent_id,
        "start": new_location_start,
        "end": new_location_end,
        "strand": cds.location.strand,
        "locus_tag": cds.locus_tag,
        "gene": cds.gene,
        "product": cds.product})

    store[parent_id].append({"Name": parent_id, "Track": {"Name":parent_id, "Length":parent_length}, "CDSs":cds_json})