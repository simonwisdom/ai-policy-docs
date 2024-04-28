import { GitHubBanner, Refine } from "@refinedev/core";
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

import { ConfigProvider, App as AntdApp } from "antd";
import "@refinedev/antd/dist/reset.css";

import {
  DocumentList,
  // DocumentCreate,
  // DocumentEdit,
  DocumentShow,
} from "./pages/documents";

const API_TOKEN = import.meta.env.VITE_AIRTABLE_API_TOKEN || "default_token";
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || "default_base_id";

if (!import.meta.env.VITE_AIRTABLE_API_TOKEN || !import.meta.env.VITE_AIRTABLE_BASE_ID) {
    console.error("API token or Base ID is undefined.");
}


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(API_TOKEN, BASE_ID)}
            routerProvider={routerProvider}
            resources={[
              {
                name: "documents",
                list: "/documents",
                // create: "/documents/new",
                // edit: "/documents/:id/edit",
                show: "/documents/:id",
              }
            ]}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <ThemedLayoutV2>
                    <Outlet />
                  </ThemedLayoutV2>
                }
              >
                <Route
                  index
                  element={<NavigateToResource resource="documents" />}
                />

                <Route path="/documents">
                  <Route index element={<DocumentList />} />
                  {/* <Route path="new" element={<DocumentCreate />} /> If you have a create view */}
                  {/* <Route path=":id/edit" element={<DocumentEdit />} /> If you have an edit view */}
                  <Route path=":id" element={<DocumentShow />} /> {/* If you have a show view */}
                </Route>



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
