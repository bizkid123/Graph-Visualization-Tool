class Grid {
    constructor(rows, cols, defaultNodeValue = null) {
        this.rows = rows;
        this.cols = cols;
        this.grid = Array(rows).fill(null).map(() => Array(cols).fill(defaultNodeValue));
    }

    setNode(row, col, value) {
        this.grid[row][col] = value;
    }

    getNode(row, col) {
        return this.grid[row][col];
    }

    addRow() {
        this.grid.push(Array(this.cols).fill(null));
        this.rows++;
    }

    addCol() {
        this.grid.forEach(row => row.push(null));
        this.cols++;
    }

    removeRow() {
        this.grid.pop();
        this.rows--;
    }

    removeCol() {
        this.grid.forEach(row => row.pop());
        this.cols--;
    }
}


class CytoscapeGrid {
    constructor(container, grid) {
        this.grid = grid;
        this.cellWidth = 20;
        this.cellHeight = 20;
        
        // Initialize cytoscape with styling
        this.cy = cytoscape({
            container,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'white',
                        'border-color': 'black',
                        'border-width': '2px',
                        'border-style': 'solid',
                        'width': this.cellWidth,
                        'height': this.cellHeight,
                        'shape': 'rectangle',
                        'label': 'data(label)',
                        'text-valign': 'center',  // Vertical alignment in the node's center
                        'text-halign': 'center',  // Horizontal alignment in the node's center
                    }
                },
            ],
            layout: {
                name: 'preset',
                positions: (node) => {
                    const [row, col] = node.id().slice(4).split('-').map(Number);
                    return { x: col * this.cellWidth, y: row * this.cellHeight };
                },
            },
            minZoom: .3, // minimum zoom level
            maxZoom: 10, // maximum zoom level
            autoungrabify: true, // prevent nodes from being moved
        });

        // Event listener for node double-clicks
        this.cy.on('tap', 'node', (evt) => {
            let node = evt.target;
            let nodeId = node.id();
            let nodePosition = node.renderedPosition();

            // Create an input field
            let input = document.createElement('input');
            input.style.position = 'absolute';
            input.style.left = `${nodePosition.x}px`;
            input.style.top = `${nodePosition.y}px`;
            // input.value = node.data('label');

            // Update the node label when the input field loses focus or the enter key is pressed
            const updateNodeLabel = () => {

                // Update the node label
                let newValue = input.value;
                node.data('label', newValue);
                const labelLength = newValue.toString().length;
                let fontSize = 16;
                if (labelLength > 0) {
                    fontSize = Math.min(this.cellWidth / labelLength, 16);  // Adjust as needed
                }
                node.style('font-size', fontSize);

                // Update the grid
                let [row, col] = nodeId.substring(4).split('-');  // Assumes nodeId is in the form "node{row}-{col}"
                this.grid.setNode(parseInt(row), parseInt(col), newValue);

                // Remove the input field
                if (input.parentNode) {
                    input.parentNode.removeChild(input);
                }
                // document.body.removeChild(input);
            }
            input.addEventListener('blur', updateNodeLabel);
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    updateNodeLabel();
                }
            });

            // Add the input field to the document
            document.body.appendChild(input);
            input.focus();
        });

        // this.runLayout();
        this.update();
        // this.runLayout();
        this.cy.fit('nodes', 50);
    }

    runLayout() {
        let layout = this.cy.layout({
            fit: true, // Whether to fit the viewport to the graph
            padding: 30, // Padding on fit
            avoidOverlap: true, // prevents node overlap
            avoidOverlapPadding: 10, // Extra spacing around nodes when avoidOverlap: true
        });
        this.setStyle();

        layout.run();
    }

    update() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                const nodeId = `node${row}-${col}`;

                // Check if node already exists
                if (!this.cy.$id(nodeId).nonempty()) {
                    // If not, add node with appropriate position
                    const x = col * this.cellWidth;
                    const y = row * this.cellHeight;
                    // getNode if not null, else ''
                    let nodeValue = this.grid.getNode(row, col)
                    nodeValue = nodeValue !== null ? nodeValue : '';
                    // Adjust 'font-size' based on the length of the nodeValue
                    const labelLength = nodeValue.toString().length;
                    let fontSize = 16;
                    if (labelLength > 0) {
                        fontSize = Math.min(this.cellWidth / labelLength, 16);  // Adjust as needed
                    }

                    const nodeData = { 
                        data: { id: nodeId, label: nodeValue }, 
                        position: { x: x, y: y } ,
                        style: { 'font-size': fontSize + 'px' },
                    };

                    this.cy.add(nodeData);
                } else {
                    // If node already exists, update label
                    let nodeValue = this.grid.getNode(row, col)
                    nodeValue = nodeValue !== null ? nodeValue : '';
                    this.cy.$id(nodeId).data('label', nodeValue);

                    // Adjust 'font-size' based on the length of the nodeValue
                    const labelLength = nodeValue.toString().length;
                    if (labelLength > 0) {
                        const fontSize = Math.min(this.cellWidth / labelLength, 16);  // Adjust as needed
                        this.cy.$id(nodeId).style({ 'font-size': fontSize + 'px' });
                    }
                }
            }
        }
    }



    setNode(row, col, value) {
        this.grid.setNode(row, col, value);
        const nodeId = `node${row}-${col}`;
        this.cy.$id(nodeId).data('label', value);
    }

    // Methods for adding/removing rows and columns, if needed
    addRow() {
        this.grid.addRow();
        const newRow = this.grid.rows - 1;
        for (let col = 0; col < this.grid.cols; col++) {
            const nodeId = `node${newRow}-${col}`;
            this.cy.add({ data: { id: nodeId } });
        }
    }

    addCol() {
        this.grid.addCol();
        const newCol = this.grid.cols - 1;
        for (let row = 0; row < this.grid.rows; row++) {
            const nodeId = `node${row}-${newCol}`;
            this.cy.add({ data: { id: nodeId } });
        }
    }

    removeRow() {
        const removedRow = this.grid.rows - 1;
        for (let col = 0; col < this.grid.cols; col++) {
            const nodeId = this.grid.getNode(removedRow, col);
            this.cy.$id(nodeId).remove();
        }
        this.grid.removeRow();
    }

    removeCol() {
        const removedCol = this.grid.cols - 1;
        for (let row = 0; row < this.grid.rows; row++) {
            const nodeId = this.grid.getNode(row, removedCol);
            this.cy.$id(nodeId).remove();
        }
        this.grid.removeCol();
    }

    reset(grid) {
        this.grid = grid;
        this.cy.elements().remove();
        this.update();
    }
}

function createGrid(rows, cols, default_value=null) {
    return new Grid(rows, cols, default_value);
}
