import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import Icon from "./components/Icon";
import LoginPage from "./modules/LoginPage";

import Dashboard             from "./modules/Dashboard";
import DocsHub               from "./modules/DocsHub";
import PricingModule         from "./modules/PricingModule";
import AddonsModule          from "./modules/AddonsModule";
import VideoLibrary          from "./modules/VideoLibrary";
import ResourcesHub          from "./modules/ResourcesHub";
import FeatureRegistry       from "./modules/FeatureRegistry";
import AdminPanel            from "./modules/AdminPanel";
import SearchResults         from "./modules/SearchResults";
import IntelligenceDashboard from "./modules/IntelligenceDashboard";
import AIPlaybook            from "./modules/AIPlaybook";
import CallIntelligence      from "./modules/CallIntelligence";
import KnowledgeGraph        from "./modules/KnowledgeGraph";

import { useApiData }   from "./hooks/useApiData";
import {
  docsApi, pricingApi, addonsApi,
  videosApi, resourcesApi, featuresApi,
} from "./utils/api";

const PAGE_LABELS = {
  dashboard: "Dashboard", docs: "Docs Hub", pricing: "Pricing",
  addons: "Add-ons", videos: "Videos", resources: "Resources",
  features: "Features", "ai-playbook": "AI Playbook",
  "call-intelligence": "Call Intelligence", "knowledge-graph": "Knowledge Graph",
  intelligence: "Intelligence", admin: "Admin Panel", search: "Search",
};

function AppShell() {
  const { isAdmin } = useAuth();
  const [activePage,   setActivePage]   = useState("dashboard");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

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
    setSidebarOpen(false);
  };

  const handleNav = (page) => {
    setActivePage(page);
    if (page !== "search") setSearchQuery("");
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":          return <Dashboard data={data} onNav={handleNav} />;
      case "docs":               return <DocsHub {...docs} adminMode={isAdmin} />;
      case "pricing":            return <PricingModule {...plans} adminMode={isAdmin} />;
      case "addons":             return <AddonsModule {...addons} adminMode={isAdmin} />;
      case "videos":             return <VideoLibrary {...videos} adminMode={isAdmin} />;
      case "resources":          return <ResourcesHub {...resources} adminMode={isAdmin} />;
      case "features":           return <FeatureRegistry {...features} adminMode={isAdmin} />;
      case "ai-playbook":        return <AIPlaybook />;
      case "call-intelligence":  return <CallIntelligence />;
      case "knowledge-graph":    return <KnowledgeGraph isAdmin={isAdmin} />;
      case "intelligence":       return isAdmin ? <IntelligenceDashboard /> : <Dashboard data={data} onNav={handleNav} />;
      case "search":             return <SearchResults query={searchQuery} onNav={handleNav} />;
      case "admin":              return isAdmin
        ? <AdminPanel data={data} adminMode={isAdmin} onToggleAdmin={() => {}} onNav={handleNav} />
        : <Dashboard data={data} onNav={handleNav} />;
      default:                   return <Dashboard data={data} onNav={handleNav} />;
    }
  };

  return (
    <div className="app-shell">

      {/* Mobile overlay */}
      <div
        className={"sidebar-overlay" + (sidebarOpen ? " open" : "")}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        active={activePage}
        onNav={handleNav}
        onSearch={handleSearch}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="main-content">

        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:24, height:24, borderRadius:6, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icon name="zap" size={12} color="#09090b" />
            </div>
            <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:14, color:"var(--text)" }}>
              {PAGE_LABELS[activePage] || "DoubleTick"}
            </span>
          </div>
          <div style={{ width:36 }} />
        </div>

        <div className="main-content-inner">
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
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div style={{ width:36, height:36, border:"3px solid var(--border2)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
          <span style={{ color:"var(--text-dim)", fontSize:13 }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <AppShell />;
}
