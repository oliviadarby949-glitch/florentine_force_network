"""
==========
JavaScript
==========

Create a D3 force-directed visualization of the Florentine families network.
Node size represents eigenvector centrality, and node color represents
community membership.
"""

import json

import flask
import networkx as nx


# Create the Florentine families network
G = nx.florentine_families_graph()


# Calculate the network's communities
communities = list(nx.community.label_propagation_communities(G))

# Calculate eigenvector centrality for every family
centralities = nx.eigenvector_centrality(G)


# Add name, community, and centrality attributes to each node
for family in G.nodes():
    for community_number, community in enumerate(communities):
        if family in community:
            G.nodes[family].update(
                {
                    "name": family,
                    "community": str(community_number),
                    "centrality": centralities[family],
                }
            )


# Convert the graph into node-link data that D3 can read
graph_data = nx.json_graph.node_link_data(G, edges="links")


# Write the graph data to a JSON file
with open("force/force.json", "w") as json_file:
    json.dump(graph_data, json_file)

print("Wrote node-link JSON data to force/force.json")


# Serve the visualization through Flask
app = flask.Flask(__name__, static_folder="force")


@app.route("/")
def static_proxy():
    return app.send_static_file("force.html")


print("\nGo to http://localhost:8000 to see the example\n")
app.run(port=8000)
