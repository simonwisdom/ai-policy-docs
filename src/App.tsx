import { Refine } from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ErrorComponent,
  RefineThemes,
} from "@refinedev/antd";
import dataProvider from "@refinedev/airtable";
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ConfigProvider, App as AntdApp, Layout } from "antd";
import "@refinedev/antd/dist/reset.css";
import { DocumentList, DocumentShow } from "./pages/documents";

const API_TOKEN = import.meta.env.VITE_AIRTABLE_API_TOKEN || "default_token";
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || "default_base_id";

if (!import.meta.env.VITE_AIRTABLE_API_TOKEN || !import.meta.env.VITE_AIRTABLE_BASE_ID) {
  console.error("API token or Base ID is undefined.");
}

const { Content } = Layout;

const CustomLayout = () => (
  <Layout style={{ minHeight: "100vh" }}>
    <Content>
      <Outlet />
    </Content>
  </Layout>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(API_TOKEN, BASE_ID)}
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
                <Route path="/:id" element={<DocumentShow />} />
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