function createNetwork(responses) {
    // Create a set of 4 nodes, one for each question.
    const questions = [
        "Little interest or pleasure in doing things?",
        "Feeling down, depressed, or hopeless?",
        "Feeling nervous, anxious, or on edge?",
        "Not being able to stop or control worrying?"
    ];

    // Create the nodes using the responses.
    const nodes = questions.map((question, index) => ({
        id: index,
        label: question,
        value: responses[index] || 0  // Use 0 if no response
    }));

    // Create the edges. We'll connect the nodes based on their correlations.
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            // Add an edge if there's a correlation (e.g., both responses are non-zero)
            if (nodes[i].value > 0 && nodes[j].value > 0) {
                edges.push({ from: nodes[i].id, to: nodes[j].id });
            }
        }
    }

    // Create the network data structure for visualization
    const data = {
        nodes: new DataSet(nodes),
        edges: new DataSet(edges)
    };

    // Initialize the network
    const container = document.getElementById("network-graph");
    const options = {
        nodes: {
            shape: "circle",
            size: 25,
            color: { background: "#FFD700", border: "#B8860B" },
            font: { color: "#000000" }
        },
        edges: {
            width: 2,
            color: { color: "#848484", highlight: "#FF5733" },
            smooth: { enabled: true }
        },
        physics: {
            enabled: true
        }
    };

    const network = new Network(container, data, options);
}

