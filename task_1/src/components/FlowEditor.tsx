import React, { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  addEdge,
  Connection,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { useFlowContext } from "../context/FlowContext";
import { ConfigPanel } from "./ConfigPanel";
import CustomNode from "./CustomNode";
import { ComponentsPanel } from "./ComponentsPanel";

const nodeTypes = {
  auth: CustomNode,
  url: CustomNode,
  output: CustomNode,
  logic: CustomNode,
  variable: CustomNode,
  "db-find": CustomNode,
  "db-insert": CustomNode,
  "db-update": CustomNode,
  "db-delete": CustomNode,
  "db-query": CustomNode,
};

export function FlowEditor() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNode,
    setSelectedNode,
    updateNodeData,
  } = useFlowContext();
  const { project } = useReactFlow();

  useEffect(() => {
    // Create a default URL node when the editor initializes
    const defaultNode = {
      id: `url_node_${Date.now()}`,
      type: "url",
      position: { x: 100, y: 100 },
      data: {
        label: "URL",
        path: "/api/resource", // Default path
        method: "GET", // Default method
      },
    };
    setNodes((nds) => [...nds, defaultNode]);
  }, [setNodes]);

  const onNodesChange = React.useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = React.useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = React.useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = React.useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = React.useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <ConfigPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdateNode={updateNodeData}
      />
    </div>
  );
}
