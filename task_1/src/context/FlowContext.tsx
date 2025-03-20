import React, { createContext, useContext, useState, ReactNode } from "react";
import { Node, Edge } from "reactflow";

// Define interfaces from the original store
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

// Define the shape of our context state
interface FlowContextType {
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

// Create default settings
const defaultSettings: Settings = {
  globalKey: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  databaseType: "mysql",
  authType: "session",
  timezone: "UTC",
  dbHost: "localhost",
  dbPort: "3306",
  dbUser: "root",
  dbPassword: "root",
  dbName: `database_${new Date().toISOString().split("T")[0]}`,
};

// Create the context with default values
const FlowContext = createContext<FlowContextType>({
  nodes: [],
  edges: [],
  selectedNode: null,
  models: [],
  roles: [],
  routes: [],
  settings: defaultSettings,
  defaultTablesShown: false,

  setNodes: () => {},
  setEdges: () => {},
  setSelectedNode: () => {},
  updateNodeData: () => {},
  addModel: () => {},
  updateModel: () => {},
  addRole: () => {},
  updateRole: () => {},
  deleteRole: () => {},
  addRoute: () => {},
  updateRoute: () => {},
  deleteRoute: () => {},
  updateSettings: () => {},
  setDefaultTablesShown: () => {},
  updateNode: () => {},
});

// Create a provider component
interface FlowProviderProps {
  children: ReactNode;
}

export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
  const [nodes, setNodesState] = useState<Node[]>([]);
  const [edges, setEdgesState] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNodeState] = useState<Node | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [defaultTablesShown, setDefaultTablesShownState] =
    useState<boolean>(false);

  // Implementation of all the functions
  const setNodes = (nodesOrFn: Node[] | ((prev: Node[]) => Node[])) => {
    if (typeof nodesOrFn === "function") {
      setNodesState((prev) => nodesOrFn(prev));
    } else {
      setNodesState(nodesOrFn);
    }
  };

  const setEdges = (edgesOrFn: Edge[] | ((prev: Edge[]) => Edge[])) => {
    if (typeof edgesOrFn === "function") {
      setEdgesState((prev) => edgesOrFn(prev));
    } else {
      setEdgesState(edgesOrFn);
    }
  };

  const setSelectedNode = (node: Node | null) => {
    setSelectedNodeState(node);
  };

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodesState((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  const addModel = (model: Model) => {
    setModels((prevModels) => [...prevModels, model]);
  };

  const updateModel = (model: Model) => {
    setModels((prevModels) =>
      prevModels.map((m) => (m.id === model.id ? model : m))
    );
  };

  const addRole = (role: Role) => {
    setRoles((prevRoles) => [...prevRoles, role]);
  };

  const updateRole = (role: Role) => {
    setRoles((prevRoles) =>
      prevRoles.map((r) => (r.id === role.id ? role : r))
    );
  };

  const deleteRole = (roleId: string) => {
    setRoles((prevRoles) => prevRoles.filter((r) => r.id !== roleId));
  };

  const addRoute = (route: Route) => {
    setRoutes((prevRoutes) => [...prevRoutes, route]);
  };

  const updateRoute = (route: Route) => {
    setRoutes((prevRoutes) =>
      prevRoutes.map((r) => (r.id === route.id ? route : r))
    );
  };

  const deleteRoute = (routeId: string) => {
    setRoutes((prevRoutes) => prevRoutes.filter((r) => r.id !== routeId));
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const setDefaultTablesShown = (shown: boolean) => {
    setDefaultTablesShownState(shown);
  };

  const updateNode = (nodeId: string, newData: any) => {
    console.log("Updating node in context:", nodeId, newData);
    setNodesState((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  };

  // Create the value object with all state and functions
  const contextValue: FlowContextType = {
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
    updateSettings,
    setDefaultTablesShown,
    updateNode,
  };

  return (
    <FlowContext.Provider value={contextValue}>{children}</FlowContext.Provider>
  );
};

// Custom hook to use the context
export const useFlowContext = () => useContext(FlowContext);
