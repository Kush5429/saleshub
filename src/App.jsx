import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./modules/Dashboard";
import DocsHub from "./modules/DocsHub";
import PricingModule from "./modules/PricingModule";
import VideoLibrary from "./modules/VideoLibrary";
import ResourcesHub from "./modules/ResourcesHub";
import FeatureRegistry from "./modules/FeatureRegistry";
import AdminPanel from "./modules/AdminPanel";
import { usePersistentData } from "./hooks/usePersistentData";
import { DEFAULT_DATA, STORAGE_KEYS } from "./data/defaultData";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [adminMode,  setAdminMode]  = useState(false);

  const [docs,      setDocs]      = usePersistentData(STORAGE_KEYS.docs,      DEFAULT_DATA.docs);
  const [plans,     setPlans]     = usePersistentData(STORAGE_KEYS.plans,     DEFAULT_DATA.plans);
  const [addons,    setAddons]    = usePersistentData(STORAGE_KEYS.addons,    DEFAULT_DATA.addons);
  const [videos,    setVideos]    = usePersistentData(STORAGE_KEYS.videos,    DEFAULT_DATA.videos);
  const [resources, setResources] = usePersistentData(STORAGE_KEYS.resources, DEFAULT_DATA.resources);
  const [features,  setFeatures]  = usePersistentData(STORAGE_KEYS.features,  DEFAULT_DATA.features);

  const data = { docs, plans, addons, videos, resources, features };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard data={data} onNav={setActivePage} />;
      case "docs":
        return <DocsHub docs={docs} setDocs={setDocs} adminMode={adminMode} />;
      case "pricing":
      case "addons":
        return <PricingModule plans={plans} setPlans={setPlans} addons={addons} setAddons={setAddons} adminMode={adminMode} />;
      case "videos":
        return <VideoLibrary videos={videos} setVideos={setVideos} adminMode={adminMode} />;
      case "resources":
        return <ResourcesHub resources={resources} setResources={setResources} adminMode={adminMode} />;
      case "features":
        return <FeatureRegistry features={features} setFeatures={setFeatures} adminMode={adminMode} />;
      case "admin":
        return <AdminPanel data={data} adminMode={adminMode} onToggleAdmin={() => setAdminMode(m => !m)} onNav={setActivePage} />;
      default:
        return <Dashboard data={data} onNav={setActivePage} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        active={activePage}
        onNav={setActivePage}
        adminMode={adminMode}
        onToggleAdmin={() => setAdminMode(m => !m)}
      />
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto", maxWidth: "calc(100vw - 220px)" }}>
        {renderPage()}
      </main>
    </div>
  );
}
