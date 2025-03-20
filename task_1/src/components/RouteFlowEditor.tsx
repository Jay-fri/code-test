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
  Panel,
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
    updateRoute,
  } = useFlowContext();

  // Add state to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  useEffect(() => {
    // Load saved flow data if it exists
    if (route.flowData) {
      setNodes(route.flowData.nodes);
      setEdges(route.flowData.edges);
    } else {
      // Create default URL node for new routes
      const defaultNode = {
        id: `node_${Date.now()}`,
        type: "url",
        position: { x: 100, y: 100 },
        data: {
          label: "URL",
          path: route.url,
          method: route.method,
        },
      };
      setNodes([defaultNode]);
      setEdges([]);
    }
    // Reset unsaved changes flag when route changes
    setHasUnsavedChanges(false);
  }, [route, setNodes, setEdges]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      setHasUnsavedChanges(true);
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setHasUnsavedChanges(true);
    },
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
      setHasUnsavedChanges(true);
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

  // Update the updateNodeData function to track changes
  const handleUpdateNodeData = useCallback(
    (nodeId, newData) => {
      updateNodeData(nodeId, newData);
      setHasUnsavedChanges(true);
    },
    [updateNodeData]
  );

  // Store current flow state in session storage when component unmounts or before navigation
  useEffect(() => {
    // Store current state in session storage
    if (hasUnsavedChanges) {
      const tempFlowData = { nodes, edges, routeId: route.id };
      sessionStorage.setItem("tempFlowData", JSON.stringify(tempFlowData));
    }

    // Check for temp data on mount
    const checkForTempData = () => {
      const tempDataStr = sessionStorage.getItem("tempFlowData");
      if (tempDataStr) {
        try {
          const tempData = JSON.parse(tempDataStr);
          // Only restore if for the same route
          if (tempData.routeId === route.id) {
            setNodes(tempData.nodes);
            setEdges(tempData.edges);
            setHasUnsavedChanges(true);
          }
        } catch (e) {
          console.error("Failed to parse temporary flow data", e);
        }
      }
    };

    checkForTempData();

    // Cleanup on unmount
    return () => {
      // We don't clear temp data on unmount, so it persists for return visits
    };
  }, [route.id, nodes, edges, hasUnsavedChanges]);

  const handleSave = () => {
    updateRoute({
      ...route,
      flowData: {
        nodes,
        edges,
      },
    });
    setHasUnsavedChanges(false);
    // Clear temp data after saving
    sessionStorage.removeItem("tempFlowData");
    onClose();
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      // Store current state in session storage before navigating away
      const tempFlowData = { nodes, edges, routeId: route.id };
      sessionStorage.setItem("tempFlowData", JSON.stringify(tempFlowData));
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Routes
          </button>
          <h2 className="ml-4 text-lg font-semibold">
            {route.name} ({route.method} {route.url})
            {hasUnsavedChanges && (
              <span className="ml-2 text-amber-500 text-sm">
                (Unsaved changes)
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            hasUnsavedChanges
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!hasUnsavedChanges}
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
            onUpdateNode={handleUpdateNodeData}
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
