from antismash.common import secmet
from antismash.common.secmet.locations import convert_protein_position_to_dna
from Bio.SeqFeature import FeatureLocation

def get_alignment_location_on_parent(alignment, record,
                                     parent, selected):
    if selected == "query":
        selected = ("qseqid", "qstart", "qend")
    else:
        selected = ("sseqid", "sstart", "send")

    # try:
    cds_location = record.get_cds_by_name(alignment[selected[0]].split("_",1)[1]).location
    # except Exception as e:
        # print(e,"Cannot get location for %s from record %s" %(alignment[selected[0]].split("_",1)[1], record))
    alignment_location = convert_protein_position_to_dna(int(alignment[selected[1]]), int(alignment[selected[2]]), cds_location)
    if isinstance(parent,secmet.record.Record):
        alignment_location = FeatureLocation(alignment_location[0], alignment_location[1])
    else:
        alignment_location = FeatureLocation(alignment_location[0]-parent.location.start, alignment_location[1]-parent.location.start)
    return alignment_location