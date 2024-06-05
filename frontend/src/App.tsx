import React, { useState } from 'react';
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
import { ConfigProvider, App as AntdApp, Layout, Button } from "antd";
import "@refinedev/antd/dist/reset.css";
import { DocumentList } from "./pages/documents";
import { About } from "./pages/About";
import { Charts } from "./pages/Charts";
import { Link } from 'react-router-dom';
import './App.css';
import { StateProvider } from './components/StateContext';
import HelpSidebar from './components/HelpSidebar';
import SearchAssistant from './components/SearchAssistant';

const { Content } = Layout;

const CustomLayout: React.FC<{ toggleHelpSidebar: () => void; toggleChatbotSidebar: () => void }> = ({ toggleHelpSidebar, toggleChatbotSidebar }) => (
  <Layout style={{ minHeight: "100vh" }}>
    <Layout.Header className="custom-header">
      <nav>
        <div className="header-title">AI Policy Docs</div>
        <ul>
          <li>
            <Button type="link" onClick={toggleHelpSidebar} className="nav-link">
              About
            </Button>
          </li>
          <li>
            <Button type="link" onClick={toggleChatbotSidebar} className="nav-link">
              Search Assistant
            </Button>
          </li>
        </ul>
      </nav>
    </Layout.Header>
    <Layout>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  </Layout>
);

const API_URL =
  import.meta.env.MODE === "production"
    ? `${import.meta.env.VITE_BACKEND_URL_PROD || "https://aipolicydocs-2612a9348c68.herokuapp.com"}/api`
    : `${import.meta.env.VITE_BACKEND_URL_DEV || "http://localhost:3001"}/api`;

const App: React.FC = () => {
  const [isHelpSidebarOpen, setIsHelpSidebarOpen] = useState(false);
  const [isChatbotSidebarOpen, setIsChatbotSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [llmResponse, setLLMResponse] = useState('');

  const handleSearchResults = (results: any[], response: string) => {
    setSearchResults(results);
    setLLMResponse(response);
  };

  const toggleHelpSidebar = () => {
    setIsHelpSidebarOpen(!isHelpSidebarOpen);
  };

  const toggleChatbotSidebar = () => {
    console.log('Toggling search assistant sidebar');
    setIsChatbotSidebarOpen(!isChatbotSidebarOpen);
  };

  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <StateProvider>
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
                <Route element={<CustomLayout toggleHelpSidebar={toggleHelpSidebar} toggleChatbotSidebar={toggleChatbotSidebar} />}>
                  <Route index element={<DocumentList isHelpSidebarOpen={isHelpSidebarOpen} />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
              {isHelpSidebarOpen && <HelpSidebar onClose={toggleHelpSidebar} />}
              {isChatbotSidebarOpen && (
                <SearchAssistant
                  isOpen={isChatbotSidebarOpen}
                  onClose={toggleChatbotSidebar}
                  onSearchResults={handleSearchResults}
                  searchResults={searchResults}
                  llmResponse={llmResponse}
                />
              )}
            </Refine>
          </StateProvider>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;