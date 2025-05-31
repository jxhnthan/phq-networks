function createNetwork(responses) {
    // Ensure responses array has 9 elements, defaulting to 0 if missing.
    const phq9_responses = Array.from({ length: 9 }, (_, i) => responses[i] || 0);

    // PHQ-9 Question Labels (keeping them descriptive but mindful of space on nodes)
    const questions = [
        "Q1: Little interest/pleasure",
        "Q2: Feeling down/depressed",
        "Q3: Sleep problems",
        "Q4: Tired/little energy",
        "Q5: Poor appetite/overeating",
        "Q6: Feeling bad about self",
        "Q7: Trouble concentrating",
        "Q8: Slow/fidgety movement",
        "Q9: Thoughts of self-harm/death"
    ];

    // Calculate total score for the "Total Score" node
    const totalScore = phq9_responses.reduce((sum, score) => sum + score, 0);

    // Define the nodes for the network
    const nodesData = questions.map((question, index) => ({
        id: index,
        label: question,
        value: phq9_responses[index],
        color: {
            background: getQuestionNodeColor(index),
            border: '#AAAAAA',
            highlight: { background: '#ADD8E6', border: '#1E90FF' } // Light blue highlight on hover
        }
    }));

    // Add the "Total Score" node with a distinct color
    nodesData.push({
        id: 9,
        label: "Total Score",
        value: totalScore,
        color: {
            background: '#6C7A89',
            border: '#455A64',
            highlight: { background: '#546E7A', border: '#263238' }
        }
    });

    const nodes = new vis.DataSet(nodesData);

    // Create the edges.
    const edges = [];
    const maxScorePerQuestion = 3;

    // 1. Edges between all PHQ-9 question nodes (Q1-Q9)
    for (let i = 0; i < 9; i++) {
        for (let j = i + 1; j < 9; j++) {
            const diff = Math.abs(phq9_responses[i] - phq9_responses[j]);
            const similarity = 1 - (diff / maxScorePerQuestion);

            if (similarity > 0) {
                edges.push({
                    from: i,
                    to: j,
                    value: similarity * 4,
                    title: `Similarity: ${similarity.toFixed(2)}`,
                    color: {
                        color: '#D3D3D3',
                        highlight: '#888888',
                        hover: '#888888'
                    },
                    width: 1
                });
            }
        }
    }

    // 2. Edges from each PHQ-9 question node to the "Total Score" node
    phq9_responses.forEach((score, idx) => {
        if (score > 0) {
            edges.push({
                from: idx,
                to: 9,
                value: score * 1.5,
                title: `${questions[idx]} (Score: ${score})`,
                color: {
                    color: '#B0B0B0',
                    highlight: '#546E7A',
                    hover: '#546E7A'
                },
                width: 1.5
            });
        }
    });

    const data = {
        nodes: nodes,
        edges: new vis.DataSet(edges)
    };

    const container = document.getElementById("network-graph");
    if (!container) {
        console.error("Error: Network container with ID 'network-graph' not found in HTML.");
        return;
    }

    const options = {
        nodes: {
            shape: "dot",
            size: 20,
            font: {
                color: "#333333",
                size: 14,
                face: 'sans-serif'
            },
            borderWidth: 1,
            shadow: false,
            margin: {
                top: 5, bottom: 5, left: 5, right: 5
            },
            // Add cursor style to indicate draggability
            // This applies when hovering over a node
            // Note: Vis.js applies its own cursor, but this can reinforce it.
            // For general canvas dragging, Vis.js handles it automatically.
            // You might not see this 'grab' cursor directly in the Vis.js canvas,
            // as Vis.js manages its own internal cursor state.
            // However, it's good practice to include if you were building custom controls.
            // For Vis.js, the default drag behavior is usually sufficient.
        },
        edges: {
            width: 1,
            scaling: {
                min: 0.5,
                max: 5
            },
            color: {
                inherit: 'from',
                highlight: '#888888'
            },
            smooth: {
                enabled: true,
                type: 'continuous',
                roundness: 0.5
            },
            shadow: false
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -7000,
                centralGravity: 0.05,
                springLength: 180,
                springConstant: 0.03,
                damping: 0.3, // Slightly increased damping for faster, firmer settle
                avoidOverlap: 1
            },
            solver: 'barnesHut',
            stabilization: {
                enabled: true,
                iterations: 4000, // Increased iterations for even more robust settling
                updateInterval: 50,
                fit: true
            }
        },
        interaction: {
            dragNodes: true,        // Explicitly allow dragging nodes
            dragView: true,         // Explicitly allow dragging the canvas
            zoomView: true,         // Explicitly allow zooming
            hover: true,            // Enable hover effects
            navigationButtons: false, // Keep false for minimalist look, but user can enable if preferred
            keyboard: true          // Enable keyboard navigation
        },
    };

    const network = new vis.Network(container, data, options);

    // After stabilization, the physics engine explicitly stops.
    network.on("stabilizationIterationsDone", function () {
        network.setOptions( { physics: false } );
        console.log("Network stabilization complete. Physics disabled.");
        
        // Optional: Add a temporary visual hint to the user
        const hintDiv = document.createElement('div');
        hintDiv.className = 'absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-lg opacity-0 transition-opacity duration-500';
        hintDiv.textContent = 'Drag nodes to rearrange!';
        hintDiv.style.zIndex = '1000'; // Ensure it's on top
        hintDiv.style.pointerEvents = 'none'; // Don't block clicks
        document.body.appendChild(hintDiv);

        // Fade in and then fade out
        setTimeout(() => {
            hintDiv.style.opacity = '1';
        }, 100); // Small delay to allow element to be rendered

        setTimeout(() => {
            hintDiv.style.opacity = '0';
            setTimeout(() => hintDiv.remove(), 500); // Remove after fade out
        }, 3000); // Display for 3 seconds
    });


    // Helper functions for minimalist color palette
    function getQuestionNodeColor(index) {
        const colors = [
            '#F0F0F0', '#E0E0E0', '#D0D0D0', '#C0C0C0', '#B0B0B0',
            '#A0A0A0', '#909090', '#808080', '#707070'
        ];
        return colors[index % colors.length];
    }

    function getBorderColor(index) {
        return '#AAAAAA';
    }
}
