import { AlignmentData } from './gc_object.js';
import { draw_gene_cluster_tracks } from './gene_cluster_tracks.js';
import { draw_controls } from './controls.js';
import { draw_alignment } from './alignment_chart.js';

var drag_opts;
var t;
var x_scale;
var y_scale;
var svg;
var controls_svg;
var x_start_drag;

class gene_cluster_alignment_chart {

    initiate_chart() {

        this.width = d3.select("#alignment_svg").node().getBoundingClientRect().width; // total width of the main row -30 for the controls
        this.height = 600;
        this.t = d3.transition().duration(750);

        this.opts = { "height": this.height, "width": this.width, "y_padding": 50, "padding": 10 };
        drag_opts = this.opts;
        t = this.t;

        this.svg = d3.select("#alignment_svg");
        svg = this.svg;
        this.controls_svg = d3.select("#controls_svg");
        controls_svg = this.controls_svg;
    };

    update(dat) {
        console.log("Updating alignment chart");

        this.y_scale = d3.scaleBand()
            .domain(dat.get_active_clusters_in_order().map(d => d.name))
            .rangeRound([this.opts.y_padding, this.opts.height]);

        this.x_scale = d3.scaleLinear()
            .domain([0, d3.max(dat.get_active_clusters_in_order().map(d => d.Length))])
            .rangeRound([this.opts.padding, this.opts.width]);

        x_scale = this.x_scale;
        y_scale = this.y_scale;
        svg = this.svg;
        t = this.t;



        draw_alignment(dat, this.svg, this.x_scale, this.y_scale, { "gene_highlight": false, "alignment_cutoff": parseInt(d3.select("#myRange").node().value) }, this.t);
        draw_gene_cluster_tracks(dat, this.svg, this.x_scale, this.y_scale, this.t);
        draw_controls(dat, this.controls_svg, this.y_scale, this.t);
        // var current_controls = new draw_controls({"dat":dat,"controls_svg":this.controls_svg, "y_scale":this.y_scale,"t": this.t,"opts": this.opts});
        // current_controls.controls_instance();

        d3.selectAll("polygon") // select polygon, modify alignment
            .on("click", focus_alignment_combined)

        d3.selectAll(".selector_circle").call(d3.drag()
            .on("start", control_dragstarted)
            .on("drag", control_dragged)
            .on("end", control_dragended)
        );

        // d3.selectAll(".selector_circle")
        // 	.on("click",reverse_and_plot);

        d3.select("#myRange")
            .on("change", function () {
                var cutoff_val = parseInt(d3.select("#myRange").node().value);

                // console.log(cutoff_val);
                draw_alignment(dat, svg, x_scale, y_scale, { "gene_highlight": false, "alignment_cutoff": cutoff_val }, t);
                d3.select("#cutoff_displayed_value").text(String(cutoff_val));
            });



        function focus_alignment_combined(d) {
            console.log("Focusing alignment event")
            console.log(d3.select(this))

            if (d3.select(this).attr("selected") == "true") {
                d3.select(this).attr("selected", false)
                draw_alignment(dat, svg, x_scale, y_scale, { "gene_highlight": false, "alignment_cutoff": parseInt(d3.select("#myRange").node().value) });

            } else {

                draw_alignment(dat, svg, x_scale, y_scale, { "alignment_cutoff": parseInt(d3.select("#myRange").node().value), "focus": true, "gene_highlight": d.tag, "bgc_data": { "origin": d3.select(this).datum().origin, "locus_tag": d3.select(this).datum().locus_tag } }, t);

                d3.select(this).attr("selected", true)
            }
        };

        function control_dragstarted(d) {
            console.log("Dragging")
            d3.select(this).raise().classed("active", true);
            x_start_drag = Math.round(d3.event.x);
        }

        function control_dragged(d) {
            d3.select(this).attr("cy", d.cy = Math.round(d3.event.y)+10);
            console.log(Math.round(d3.event.y));
            d3.select(this).attr("cx", d.cx = Math.round(d3.event.x));
            if ((x_start_drag - Math.round(d3.event.x)) < - 20) {
                d3.select(this).style("fill", "red");
            } else {
                d3.select(this).style("fill", "teal");
            }
        }

        function control_dragended(d) {
            var slide = ((x_start_drag - Math.round(d3.event.x)) < - 20);
            if (slide) {
                console.log("Slide")
                var tmp_name = d3.select(this).datum().Name;
                console.log("Temp name", tmp_name);
                dat.reverse(tmp_name);
                var reversed = dat.clusters[tmp_name].reversed;
                console.log("Reversed");
                console.log(reversed)
                if (!reversed) {
                    d3.select(this).style("fill", "teal");
                    d3.select(this).attr("orientation", "normal");
                } else {
                    d3.select(this).style("fill", "red");
                    d3.select(this).attr("orientation", "reversed");
                }
            }
            d3.select(this).classed("active", false);

            var new_domains = get_domains_y_ordered(".selector_circle");
            dat.order = new_domains;

            y_scale = d3.scaleBand()
                .domain(new_domains)
                .rangeRound([drag_opts.y_padding, drag_opts.height]);

            var Tracks = d3.selectAll("rect")
                .transition(t)
                .attr("y", d => d.y = y_scale(d.Name));

            draw_alignment(dat, svg, x_scale, y_scale, { "gene_highlight": false, "alignment_cutoff": parseInt(d3.select("#myRange").node().value) }, t);
            draw_gene_cluster_tracks(dat, svg, x_scale, y_scale, t);
            draw_controls(dat, controls_svg, y_scale, t);

        }

        function get_domains_y_ordered(element) {
            console.log("Getting ordered domains")
            var domains = [];
            d3.selectAll(element).each(function (e) { domains.push(e); });

            var sorted_cy = domains.map(d => d.cy).sort(function (a, b) { return a - b });
            var domain_dict = {};
            domains.map(d => domain_dict[d.cy] = d.Name)

            var new_domains = sorted_cy.map(d => domain_dict[d]);

            return new_domains
        }



        function reverse_and_plot() {
            // if (d3.event.defaultPrevented) return;

            var tmp_name = d3.select(this).datum().Name;
            console.log("Temp name", tmp_name);
            dat.reverse(tmp_name);
            var reversed = dat.clusters[tmp_name].reversed;
            console.log("Reversed");
            console.log(reversed)
            if (!reversed) {
                d3.select(this).style("fill", "teal");
                d3.select(this).attr("orientation", "normal");
            } else {
                d3.select(this).style("fill", "red");
                d3.select(this).attr("orientation", "reversed");
            }


            // draw_alignment(dat,
            //                svg,
            //                x_scale,
            //                y_scale,
            //                {"gene_highlight": false,
            //                 "alignment_cutoff": parseInt(d3.select("#myRange").node().value)},
            //                 t);
            // draw_gene_cluster_tracks(dat, svg, x_scale, y_scale, t);

        }
    };

}

export { gene_cluster_alignment_chart };