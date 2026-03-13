import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./modules/LoginPage";

import Dashboard            from "./modules/Dashboard";
import DocsHub              from "./modules/DocsHub";
import PricingModule        from "./modules/PricingModule";
import AddonsModule         from "./modules/AddonsModule";
import VideoLibrary         from "./modules/VideoLibrary";
import ResourcesHub         from "./modules/ResourcesHub";
import FeatureRegistry      from "./modules/FeatureRegistry";
import AdminPanel           from "./modules/AdminPanel";
import SearchResults        from "./modules/SearchResults";
import IntelligenceDashboard from "./modules/IntelligenceDashboard";

import { useApiData }   from "./hooks/useApiData";
import {
  docsApi, pricingApi, addonsApi,
  videosApi, resourcesApi, featuresApi,
} from "./utils/api";

function AppShell() {
  const { isAdmin } = useAuth();
  const [activePage,  setActivePage]  = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const docs      = useApiData(docsApi);
  const plans     = useApiData(pricingApi);
  const addons    = useApiData(addonsApi);
  const videos    = useApiData(videosApi);
  const resources = useApiData(resourcesApi);
  const features  = useApiData(featuresApi);

  const data = {
    docs: docs.data, plans: plans.data, addons: addons.data,
    videos: videos.data, resources: resources.data, features: features.data,
  };

  const handleSearch = (val) => {
    setSearchQuery(val);
    if (val.trim()) setActivePage("search");
    else setActivePage("dashboard");
  };

  const handleNav = (page) => {
    setActivePage(page);
    if (page !== "search") setSearchQuery("");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":     return <Dashboard data={data} onNav={handleNav} />;
      case "docs":          return <DocsHub {...docs} adminMode={isAdmin} />;
      case "pricing":       return <PricingModule {...plans} adminMode={isAdmin} />;
      case "addons":        return <AddonsModule {...addons} adminMode={isAdmin} />;
      case "videos":        return <VideoLibrary {...videos} adminMode={isAdmin} />;
      case "resources":     return <ResourcesHub {...resources} adminMode={isAdmin} />;
      case "features":      return <FeatureRegistry {...features} adminMode={isAdmin} />;
      case "intelligence":  return isAdmin ? <IntelligenceDashboard /> : <Dashboard data={data} onNav={handleNav} />;
      case "search":        return <SearchResults query={searchQuery} onNav={handleNav} />;
      case "admin":         return isAdmin
        ? <AdminPanel data={data} adminMode={isAdmin} onToggleAdmin={() => {}} onNav={handleNav} />
        : <Dashboard data={data} onNav={handleNav} />;
      default:              return <Dashboard data={data} onNav={handleNav} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        active={activePage}
        onNav={handleNav}
        onSearch={handleSearch}
      />
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>
          <ErrorBoundary key={activePage}>
            {renderPage()}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <AppShell />;
}
