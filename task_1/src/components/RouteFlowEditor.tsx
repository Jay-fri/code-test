import React, { useCallback, useRef, useEffect } from "react";
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
import { ArrowLeft, Save } from "lucide-react";
import { useFlowContext } from "../context/FlowContext";
import { ConfigPanel } from "./ConfigPanel";
import { ComponentsPanel } from "./ComponentsPanel";
import CustomNode from "./CustomNode";
import "reactflow/dist/style.css";

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

interface FlowEditorContentProps {
  route: any;
  onClose: () => void;
}

function FlowEditorContent({ route, onClose }: FlowEditorContentProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNode,
    setSelectedNode,
    updateNodeData,
  } = useFlowContext();

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1).replace("-", " "),
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Routes
          </button>
          <h2 className="ml-4 text-lg font-semibold">
            {route.name} ({route.method} {route.url})
          </h2>
        </div>
        <button
          onClick={() => {
            // Save logic here
            onClose();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ComponentsPanel />
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Control"
            selectionKeyCode="Shift"
            snapToGrid={true}
            snapGrid={[15, 15]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdateNode={updateNodeData}
          />
        )}
      </div>
    </div>
  );
}

export function RouteFlowEditor({ route, onClose }: FlowEditorContentProps) {
  return (
    <ReactFlowProvider>
      <FlowEditorContent route={route} onClose={onClose} />
    </ReactFlowProvider>
  );
}
