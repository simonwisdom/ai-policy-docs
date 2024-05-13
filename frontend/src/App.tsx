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

const { Content } = Layout;

const CustomLayout = () => (
  <Layout style={{ minHeight: "100vh" }}>
    <Content>
      <Outlet />
    </Content>
  </Layout>
);

const API_URL =
  import.meta.env.MODE === "production"
    ? `${import.meta.env.VITE_BACKEND_URL_PROD || "https://your-backend-app-name.herokuapp.com"}/api`
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