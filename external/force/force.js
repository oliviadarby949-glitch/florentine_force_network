// This is adapted from
// https://bl.ocks.org/mbostock/2675ff61ea5e063ede2b5d63c08020c7

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));


d3.json("force/force.json", function (error, graph) {
    if (error) throw error;


    // Map eigenvector centrality to circle radius.
    // scaleSqrt makes circle area proportional to centrality.
    var radiusScale = d3.scaleSqrt()
        .domain(d3.extent(graph.nodes, function (d) {
            return d.centrality;
        }))
        .range([5, 25]);


    // Assign a categorical color to each community.
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);


    // Draw the links between families.
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line");


    // Draw the family nodes.
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter()
        .append("circle")

        // Set radius according to centrality.
        .attr("r", function (d) {
            return radiusScale(d.centrality);
        })

        // Set color according to community.
        .attr("fill", function (d) {
            return colorScale(d.community);
        })

        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    // Display information when the user hovers over a node.
    node.append("title")
        .text(function (d) {
            return d.name +
                "\nCentrality: " + d.centrality.toFixed(3) +
                "\nCommunity: " + d.community;
        });


    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);


    simulation.force("link")
        .links(graph.links);


    function ticked() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });


        node
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    }
});


function dragstarted(d) {
    if (!d3.event.active) {
        simulation.alphaTarget(0.3).restart();
    }

    d.fx = d.x;
    d.fy = d.y;
}


function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}


function dragended(d) {
    if (!d3.event.active) {
        simulation.alphaTarget(0);
    }

    d.fx = null;
    d.fy = null;
}
