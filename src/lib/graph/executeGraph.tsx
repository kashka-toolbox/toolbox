import { NodeState } from "@/lib/graph/NodeState";
import { NodeIOIdentifier } from "../../components/graph/NodeIO";

export async function executeGraph(
    nodes: Map<string, NodeState<any, any>>,
    edges: {
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    }[],
    setNodeState: (nodeId: string, newState: Partial<NodeState<any, any>>) => void) {
    console.log("Executing graph with nodes:", nodes, "and edges:", edges);

    // STEP A: prepare
    // override setNodeState to also update the node state in this context
    const originalSetNodeState = setNodeState;
    setNodeState = (nodeId: string, newState: Partial<NodeState<any, any>>) => {
        originalSetNodeState(nodeId, newState);
        const node = nodes.get(nodeId);
        if (node) {
            nodes.set(nodeId, { ...node, ...newState });
        }
    };

    // STEP B: find all output nodes and build a execution order
    const outputNodes = Array.from(nodes.values()).filter(node => node.type === "output");
    if (outputNodes.length === 0) {
        console.warn("No output nodes found in the graph.");
        return;
    }

    const executionOrder: NodeState<any, any>[] = [];
    const visitedNodes = new Set<string>();

    const visitNode = (node: NodeState<any, any>) => {
        if (visitedNodes.has(node.id)) return;
        visitedNodes.add(node.id);

        // Visit all connected input nodes
        const inputEdges = edges.filter(edge => edge.toIO?.nodeId === node.id);
        inputEdges.forEach(edge => {
            const inputNode = nodes.get(edge.fromIO.nodeId);
            if (inputNode) {
                visitNode(inputNode);
            }
        });

        executionOrder.push(node);
    };

    outputNodes.forEach(outputNode => {
        visitNode(outputNode);
    });


    console.info("Execution order:", executionOrder);
    // TODO: save this order of execution as it should not change if the graph is not modified.
    // STEP C: execute each node in the order
    for (const node of executionOrder) {
        console.info(`Executing node ${node.id} of type ${node.type}`);

        // set node isProcessing to true
        setNodeState(node.id, { isProcessing: true });

        const getStateOfPreviousNodes = () => {
            const inputEdges = edges.filter(edge => edge.toIO?.nodeId === node.id);
            const previousStates: Record<string, any> = {};
            inputEdges.forEach(edge => {
                const inputNode = nodes.get(edge.fromIO.nodeId);
                if (inputNode) {
                    previousStates[edge.fromIO.nodeIOName] = inputNode.state;
                }
            });
            return previousStates;
        };

        const previousStates = getStateOfPreviousNodes();
        console.log(`Previous states for node ${node.id}:`, previousStates);

        // map the output of the prevoius nodes to the input of the current node, using the edges
        const parameters: Record<string, any> = {};
        node.inputs.forEach(input => {
            const inputEdge = edges.find(edge => edge.toIO?.nodeId === node.id && edge.toIO.nodeIOName === input.name);
            if (inputEdge) {
                const inputNode = nodes.get(inputEdge.fromIO.nodeId);
                if (inputNode) {
                    parameters[input.name] = inputNode.state[inputEdge.fromIO.nodeIOName];
                }
            } else {
                parameters[input.name] = previousStates[input.name] || null; // fallback to previous state
            }
        });

        await node.execute(parameters).then((result) => {
            console.info(`Node ${node.id} executed successfully with result:`, result, "and parameters:", parameters);

            setNodeState(node.id, { state: { ...node.state, ...result } });
            console.info(`Node ${node.id} state updated to:`, { ...node.state, ...result });
        }).catch((error) => {
            console.error(`Error executing node ${node.id}:`, error);
            // Optionally handle errors, e.g., set an error state
            setNodeState(node.id, { isProcessing: false, error: error.message });
        }).finally(() => {
            // set node isProcessing to false
            setNodeState(node.id, { isProcessing: false });
        });
    }
}
