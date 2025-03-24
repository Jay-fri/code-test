import React, { createContext, useContext, useState, ReactNode } from "react";
import { Node, Edge } from "reactflow";

interface Model {
  id: string;
  name: string;
  fields: {
    name: string;
    type: string;
    defaultValue: string;
    validation: string;
    mapping?: string;
  }[];
}

interface Role {
  id: string;
  name: string;
  slug: string;
  permissions: {
    authRequired: boolean;
    routes: string[];
    canCreateUsers?: boolean;
    canEditUsers?: boolean;
    canDeleteUsers?: boolean;
    canManageRoles?: boolean;
  };
}

interface Route {
  id: string;
  name: string;
  method: string;
  url: string;
  flowData?: {
    nodes: any[];
    edges: any[];
  };
}

interface Settings {
  globalKey: string;
  databaseType: string;
  authType: string;
  timezone: string;
  dbHost: string;
  dbPort: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  models: Model[];
  roles: Role[];
  routes: Route[];
  settings: Settings;
  defaultTablesShown: boolean;
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: Node | null) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  addModel: (model: Model) => void;
  updateModel: (model: Model) => void;
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  deleteRole: (roleId: string) => void;
  addRoute: (route: Route) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (routeId: string) => void;
  updateSettings: (settings: Settings) => void;
  setDefaultTablesShown: (shown: boolean) => void;
  updateNode: (nodeId: string, newData: any) => void;
}

const FlowContext = createContext<FlowState | undefined>(undefined);

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [settings, setSettings] = useState<Settings>({
    globalKey: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    databaseType: "mysql",
    authType: "session",
    timezone: "UTC",
    dbHost: "localhost",
    dbPort: "3306",
    dbUser: "root",
    dbPassword: "root",
    dbName: `database_${new Date().toISOString().split("T")[0]}`,
  });
  const [defaultTablesShown, setDefaultTablesShown] = useState<boolean>(false);

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  const addModel = (model: Model) => setModels((prev) => [...prev, model]);
  const updateModel = (model: Model) =>
    setModels((prev) => prev.map((m) => (m.id === model.id ? model : m)));
  const addRole = (role: Role) => setRoles((prev) => [...prev, role]);
  const updateRole = (role: Role) =>
    setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
  const deleteRole = (roleId: string) =>
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
  const addRoute = (route: Route) => setRoutes((prev) => [...prev, route]);
  const updateRoute = (route: Route) =>
    setRoutes((prev) => prev.map((r) => (r.id === route.id ? route : r)));
  const deleteRoute = (routeId: string) =>
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
  const updateNode = (nodeId: string, newData: any) => {
    console.log("Updating node in store:", nodeId, newData);
    updateNodeData(nodeId, newData);
  };

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        selectedNode,
        models,
        roles,
        routes,
        settings,
        defaultTablesShown,
        setNodes,
        setEdges,
        setSelectedNode,
        updateNodeData,
        addModel,
        updateModel,
        addRole,
        updateRole,
        deleteRole,
        addRoute,
        updateRoute,
        deleteRoute,
        updateSettings: setSettings,
        setDefaultTablesShown,
        updateNode,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlowContext must be used within a FlowProvider");
  }
  return context;
};
