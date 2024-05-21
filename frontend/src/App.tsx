import { Refine } from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ErrorComponent,
  RefineThemes,
} from "@refinedev/antd";
import dataProvider from "@refinedev/simple-rest";
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ConfigProvider, App as AntdApp, Layout } from "antd";
import "@refinedev/antd/dist/reset.css";
import { DocumentList } from "./pages/documents";
import { About } from "./pages/About";
import { Charts } from "./pages/Charts";
import { Link } from 'react-router-dom';
import './styles.css';

const { Content } = Layout;

const CustomLayout = () => (
  <Layout style={{ minHeight: "100vh" }}>
    {/* <Layout.Header className="custom-header">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/charts">Charts</Link>
          </li>
        </ul>
      </nav>
    </Layout.Header> */}
    <Content>
      <Outlet />
    </Content>
  </Layout>
);

const API_URL =
  import.meta.env.MODE === "production"
    ? `${import.meta.env.VITE_BACKEND_URL_PROD || "https://aipolicydocs-2612a9348c68.herokuapp.com"}/api`
    : `${import.meta.env.VITE_BACKEND_URL_DEV || "http://localhost:3001"}/api`;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(API_URL)}
            routerProvider={routerProvider}
            resources={[
              {
                name: "ai_documents",
                list: "/",
                show: "/:id",
              },
            ]}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
              <Routes>
                <Route element={<CustomLayout />}>
                  <Route index element={<DocumentList />} />
                  <Route path="/about" element={<About />} />
                <Route path="/charts" element={<Charts />} />
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;