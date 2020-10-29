class Bgc{

	constructor(args){
		this.name = args.Name;
		this.track = args.Track;
		this.cdss = this.format_cdss(args.CDSs);
		this.Length = this.track.Length;
        this.max_cds = d3.max(args.CDSs.map(x => x.start).concat(args.CDSs.map(x => x.end)))
        this.spacer = this.Length - this.max_cds
		// this.min_length = this.track.min_length;
		this.active = true; // setting all to true now from the start since everything will be loaded on click
		this.reversed = false;
	}		

format_cdss(CDSs){
	for (var n = 0; n < CDSs.length; n++) {
		var cds = CDSs[n]
		if (cds.locus_tag){cds.locus_tag = cds.locus_tag}
		cds.tag = cds.origin+"_"+cds.locus_tag
		cds.gene = cds.gene
		cds.product = cds.product
		cds.display_start = cds.start
		cds.display_end = cds.end
		cds.display_strand = cds.strand
	}
	return CDSs

}

reverse(){
	this.reversed = !this.reversed;
    var Length = this.track.Length;
    var max_cds = this.max_cds;
	var spacer = this.spacer;
	for (var n = 0; n < this.cdss.length; n++) {
		var cds = this.cdss[n];
		if(!this.reversed){
			var tmp_start = cds.start;
			var tmp_end = cds.end;
			var tmp_strand = cds.strand;
		}else{
			var tmp_end = max_cds-cds.start+spacer;
			var tmp_start = max_cds-cds.end+spacer;
			var tmp_strand = cds.strand*-1;
		}

		cds.display_start = tmp_start
		cds.display_end = tmp_end
		cds.display_strand = tmp_strand
	}
}


get_bgc_for_plot(){
	// function to adjust the CDS coordinates according to reverse status
	// needs to be in a loop function in main script
	// subsetting for active clusters in main script

	return {"Name":this.name, "Track": this.track, "CDSs": this.cdss};

}


}


export {Bgc};