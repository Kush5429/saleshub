import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./modules/Dashboard";
import DocsHub from "./modules/DocsHub";
import PricingModule from "./modules/PricingModule";
import AddonsModule from "./modules/AddonsModule";
import VideoLibrary from "./modules/VideoLibrary";
import ResourcesHub from "./modules/ResourcesHub";
import FeatureRegistry from "./modules/FeatureRegistry";
import AdminPanel from "./modules/AdminPanel";
import { useApiData } from "./hooks/useApiData";
import {
  docsApi, pricingApi, addonsApi,
  videosApi, resourcesApi, featuresApi,
} from "./utils/api";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [adminMode,  setAdminMode]  = useState(false);

  // Each slice is independently fetched + managed
  const docs      = useApiData(docsApi);
  const plans     = useApiData(pricingApi);
  const addons    = useApiData(addonsApi);
  const videos    = useApiData(videosApi);
  const resources = useApiData(resourcesApi);
  const features  = useApiData(featuresApi);

  // Flat arrays for Dashboard stats + AdminPanel
  const data = {
    docs:      docs.data,
    plans:     plans.data,
    addons:    addons.data,
    videos:    videos.data,
    resources: resources.data,
    features:  features.data,
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard data={data} onNav={setActivePage} />;
      case "docs":
        return <DocsHub {...docs} adminMode={adminMode} />;
      case "pricing":
        return <PricingModule {...plans} adminMode={adminMode} />;
      case "addons":
        return <AddonsModule {...addons} adminMode={adminMode} />;
      case "videos":
        return <VideoLibrary {...videos} adminMode={adminMode} />;
      case "resources":
        return <ResourcesHub {...resources} adminMode={adminMode} />;
      case "features":
        return <FeatureRegistry {...features} adminMode={adminMode} />;
      case "admin":
        return (
          <AdminPanel
            data={data}
            adminMode={adminMode}
            onToggleAdmin={() => setAdminMode(m => !m)}
            onNav={setActivePage}
          />
        );
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
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
