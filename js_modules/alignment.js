class Alignment{

  constructor(args){
  this.from = args.from;
  this.to = args.to;
  this.pident = args.pident;
  this.from.plot_start = this.from.start;
  this.from.plot_end =  this.from.end;
  this.to.plot_start =  this.to.start;
  this.to.plot_end = this.to.end;
  this.combined_tag = args.from.name+"_"+args.from.cds+"_"+args.to.name+"_"+args.to.cds;
  }


reverse(bgc){
  // need assert here if it's really bgc... I only gave the id
  if (bgc.reversed) {
    if (bgc.name == this.from.name) {
    console.log("Reversing from")
    this.from.plot_end = bgc.Length-this.from.start;
    this.from.plot_start = bgc.Length-this.from.end;
  } else if(bgc.name == this.to.name) {
    console.log("Reversing to")

    this.to.plot_end = bgc.Length-this.to.start;
    this.to.plot_start = bgc.Length-this.to.end;
  }

  } else {

   if (bgc.name == this.from.name) {
    console.log("Reversing from")
    this.from.plot_start =  this.from.start;
    this.from.plot_end = this.from.end;
  } else if(bgc.name == this.to.name) {
    console.log("Reversing to")

    this.to.plot_start = this.to.start;
    this.to.plot_end = this.to.end ;
  }

  }
  
   
}


get_plot_data(){
  return {"combined_tag": this.combined_tag, "from": this.from, "to": this.to, "pident": this.pident}
}

}

export {Alignment};

