
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './features/core/layout/Layout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { DatasetProfilePage } from './features/profile/pages/DatasetProfilePage';
import { AIInsightsPage } from './features/insights/pages/AIInsightsPage';
import { BaselineModelsPage } from './features/models/pages/BaselineModelsPage';
import { ExplainabilityPage } from './features/explainability/pages/ExplainabilityPage';
import { ReportPreviewPage } from './features/report/pages/ReportPreviewPage';
import { DatasetProvider } from './features/core/context/DatasetContext';

function App() {
  return (
    <DatasetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="upload" element={<DashboardPage />} />
            <Route path="profile" element={<DatasetProfilePage />} />
            <Route path="insights" element={<AIInsightsPage />} />
            <Route path="recommendations" element={<AIInsightsPage />} />
            <Route path="models" element={<BaselineModelsPage />} />
            <Route path="explainability" element={<ExplainabilityPage />} />
            <Route path="reports" element={<ReportPreviewPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DatasetProvider>
  );
}

export default App;