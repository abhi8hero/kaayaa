import Dashboard from './pages/Dashboard';
import TraceExplorer from './pages/TraceExplorer';
import MetricsView from './pages/MetricsView';
import LogsView from './pages/LogsView';
import WorkflowMonitoring from './pages/WorkflowMonitoring';
import AlertManagement from './pages/AlertManagement';
import IntegrationConfig from './pages/IntegrationConfig';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Dashboard',       path: '/',             element: <Dashboard />,         public: true },
  { name: 'Trace Explorer',  path: '/traces',       element: <TraceExplorer />,     public: true },
  { name: 'Metrics',         path: '/metrics',      element: <MetricsView />,       public: true },
  { name: 'Logs',            path: '/logs',         element: <LogsView />,          public: true },
  { name: 'Workflows',       path: '/workflows',    element: <WorkflowMonitoring />,public: true },
  { name: 'Alerts',          path: '/alerts',       element: <AlertManagement />,   public: true },
  { name: 'Integrations',    path: '/integrations', element: <IntegrationConfig />, public: true },
];
