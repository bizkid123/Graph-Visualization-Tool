// let data = [
//   {
//     label: "Graph1",
//     elements: {
//       nodes: [
//         { data: { id: "0", label: "Node 0" } },
//         { data: { id: "1", label: "Node 1" } },
//         { data: { id: "2", label: "Node 2" } },
//       ],
//       edges: [
//         { data: { source: "0", target: "1" } },
//         { data: { source: "1", target: "2" } },
//         { data: { source: "2", target: "0" } },
//       ],
//     },
//     settings: {
//       layout: {
//         name: "grid",
//       },
//       style: {
//         "background-color": "#f00",
//       },
//     },
//   },
//   {
//     label: "Tree1",
//     elements: {
//       nodes: [
//         { data: { id: "0", label: "Node 0" } },
//         { data: { id: "1", label: "Node 1" } },
//         { data: { id: "2", label: "Node 2" } },
//       ],
//       edges: [
//         { data: { source: "0", target: "1" } },
//         { data: { source: "0", target: "2" } },
//       ],
//     },
//     settings: {
//       layout: {
//         name: "breadthfirst",
//       },
//       style: {
//         "background-color": "#0f0",
//       },
//     },
//   },
// ];

let cy = cytoscape({
  container: document.getElementById("cy"), // container to render in

  elements: [
    // Create a compound node for each graph or tree
    ...data.map((graph) => ({
      data: { id: graph.label, label: graph.label },
      classes: "compound",
    })),

    // Add the nodes and edges of each graph or tree as children of the compound node
    ...data.flatMap((graph) =>
      graph.elements.nodes
        .map((node, i) => ({
          data: {
            ...node.data,
            id: `${graph.label}_${i}`,
            parent: graph.label,
          },
        }))
        .concat(
          graph.elements.edges.map((edge) => ({
            data: {
              ...edge.data,
              source: `${graph.label}_${edge.data.source}`,
              target: `${graph.label}_${edge.data.target}`,
            },
          }))
        )
    ),
  ],

  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(label)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
      },
    },
    {
      selector: ".compound",
      style: {
        "background-color": "#bbb",
        label: "data(label)",
      },
    },
  ],

  layout: {
    name: "preset",
  },
});

// Apply the force-directed layout to the compound nodes

// Apply the settings and layout to each graph or tree
// data.forEach((graph) => {
//   let eles = cy.elements('node[parent="' + graph.label + '"]');
//   eles.forEach(function (ele) {
//     console.log(ele.id());
//   });

//   // Apply style
//   eles.style(graph.settings.style);

//   // Apply layout
//   let layout = eles.layout(graph.settings.layout);

//   layout.run();
// });

// cy.elements(".compound").layout({ name: "cose" }).run();

function addData(data) {
  let newElements = [
    // Create a compound node for the new graph
    {
      data: { id: data.label, label: data.label },
      classes: "compound",
    },

    // Add the nodes and edges of the graph as children of the compound node
    ...data.elements.nodes
      .map((node, i) => ({
        data: {
          ...node.data,
          id: `${data.label}_${i}`,
          parent: data.label,
        },
      }))
      .concat(
        data.elements.edges.map((edge) => ({
          data: {
            ...edge.data,
            source: `${data.label}_${edge.data.source}`,
            target: `${data.label}_${edge.data.target}`,
          },
        }))
      ),
  ];

  // Add the new elements to the Cytoscape instance
  cy.add(newElements);

  // Apply the settings and layout to the new graph
  let eles = cy.elements('node[parent="' + data.label + '"]');

  eles.style(data.settings.style);

  // Apply layout
  let layout = eles.layout(data.settings.layout);
  layout.run();
  cy.elements(".compound").layout({ name: "cose" }).run();
}

function refit() {
  cy.fit();
}

function removeData(id) {
  let elementsToRemove = cy.elements('node[parent="' + id + '"]');

  // Remove the elements from the Cytoscape instance
  cy.remove(elementsToRemove);

  // Also remove the compound node
  cy.remove('node[id="' + id + '"]');
  cy.elements(".compound").layout({ name: "cose" }).run();
}

/* #################### TESTING #################### */

let graph2 = {
  label: "Graph2",
  elements: {
    nodes: [
      { data: { id: "0", label: "Node 0" } },
      { data: { id: "1", label: "Node 1" } },
    ],
    edges: [{ data: { source: "0", target: "1" } }],
  },
  settings: {
    layout: {
      name: "circle",
    },
    style: {
      "background-color": "#00f",
    },
  },
};

addData(graph2);
removeData("Graph1");
