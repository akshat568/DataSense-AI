import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardHero } from "../components/DashboardHero";
import { UploadCard } from '../components/UploadCard';
import { DatasetSummary } from '../components/DatasetSummary';
import { DatasetPreviewTable } from '../components/DatasetPreviewTable';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { QuickActions } from '../components/QuickActions';
import { useDataset } from '../../core/context/DatasetContext';
import { generateDatasetProfile, generateRecommendations } from '../../../services/api';

import {
  Upload,
  UploadCloud,
  FileSpreadsheet,
  Database,
  RefreshCw,
  ArrowRight,
  Award,
} from 'lucide-react';

/* ── Memory formatter helper ─────────────────────────────────── */
function fmtBytes(bytes: number, dec = 1): string {
  if (!bytes || !+bytes) return '0 B';
  const k = 1024;
  const s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dec))} ${s[i]}`;
}

export function DashboardPage() {
  const {
    datasetInfo,
    setDatasetInfo,
    setSessionId,
    datasetProfile,
    datasetRecommendations,
    modelResults,
    globalExplanations,
    setDatasetProfile,
    setIsProfileLoading,
    setDatasetRecommendations,
    setIsRecommendationsLoading,
  } = useDataset();

  const [showUpload, setShowUpload] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setShowUpload(true);
      searchParams.delete('upload');
      setSearchParams(searchParams, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, setSearchParams]);

  const handleUploadSuccess = async (data: any) => {
    setDatasetInfo(data);
    const sid = data.session_id;
    setSessionId(sid);
    setShowUpload(false);
    setIsProfileLoading(true);
    setIsRecommendationsLoading(true);
    try {
      const [profileRes, recRes] = await Promise.all([
        generateDatasetProfile(null, sid),
        generateRecommendations(null, sid),
      ]);
      setDatasetProfile(profileRes);
      setDatasetRecommendations(recRes);
    } catch (err) {
      console.error('Failed to generate AI profiling and recommendations', err);
    } finally {
      setIsProfileLoading(false);
      setIsRecommendationsLoading(false);
    }
  };

  const triggerUpload = () => {
    setShowUpload(true);
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col gap-6 fade-in pb-10">
      {/* ═══════════════════════════════════════
          1. REFINED WORKSPACE HEADER
          ═══════════════════════════════════════ */}
      <DashboardHero
        onUpload={triggerUpload}
        uploadCard={
          showUpload ? (
            <UploadCard
              onSuccess={handleUploadSuccess}
              isUploaded={false}
              onClose={() => setShowUpload(false)}
            />
          ) : null
        }
      />

      {/* ═══════════════════════════════════════
          2. KPI SUMMARY METRIC CARDS
          ═══════════════════════════════════════ */}
      <DatasetSummary data={datasetInfo} />

      {/* ═══════════════════════════════════════
          3. ANALYSIS WORKFLOW PIPELINE
          ═══════════════════════════════════════ */}
      <WorkflowTimeline
        datasetInfo={datasetInfo}
        datasetProfile={datasetProfile}
        datasetRecommendations={datasetRecommendations}
        modelResults={modelResults}
        globalExplanations={globalExplanations}
      />

      {/* ═══════════════════════════════════════
          4. WORKFLOW QUICK ACTIONS
          ═══════════════════════════════════════ */}
      <QuickActions />

      {/* ═══════════════════════════════════════
          5. BOTTOM SECTION: ACTIVE DATASET + PREVIEW
          ═══════════════════════════════════════ */}
      {datasetInfo ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
          {/* ── LEFT: Active Dataset Card ── */}
          <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E9E2] bg-white">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#26332D]" />
                <span className="text-[15px] font-bold text-[#26332D]">
                  Active Dataset
                </span>
              </div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]">
                Ready
              </span>
            </div>

            {/* File information row */}
            <div className="p-5 border-b border-[#E5E9E2] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center text-[#26332D] flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-bold text-[#26332D] truncate" title={datasetInfo.filename}>
                    {datasetInfo.filename}
                  </p>
                  <p className="text-[12px] text-[#64736A] mt-0.5">
                    CSV format · Loaded in memory
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics 4-column row */}
            <div className="grid grid-cols-4 border-b border-[#E5E9E2] bg-[#FAFBF9]">
              {[
                { label: 'ROWS', value: datasetInfo.rows?.toLocaleString() ?? '—' },
                { label: 'COLS', value: String(datasetInfo.columns ?? '—') },
                { label: 'MEMORY', value: fmtBytes(datasetInfo.memory_usage) },
                { label: 'FORMAT', value: 'CSV' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col items-center justify-center py-4 px-2 ${
                    i < 3 ? "border-r border-[#E5E9E2]" : ""
                  }`}
                >
                  <p className="text-[16px] font-bold font-mono text-[#26332D] leading-none">
                    {item.value}
                  </p>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#78827A] mt-1.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Model Summary if available */}
            {modelResults && (
              <div className="p-4 border-b border-[#E5E9E2] bg-[#F9FAF7]">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-1.5 text-[#64736A] font-medium">
                    <Award className="w-4 h-4 text-[#B45309]" />
                    Best Model
                  </span>
                  <span className="font-bold text-[#26332D]">
                    {modelResults.best_model?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Replace Dataset Button */}
            <div className="p-4 bg-white">
              <button
                onClick={triggerUpload}
                className="btn btn-secondary w-full gap-2 text-[13px]"
                style={{ height: '40px' }}
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#64736A]" />
                Replace Dataset
              </button>
            </div>
          </div>

          {/* ── RIGHT: Dataset Preview Table ── */}
          <DatasetPreviewTable
            preview={datasetInfo?.preview || null}
            dataTypes={datasetInfo?.data_types || null}
            totalRows={datasetInfo?.rows}
          />
        </div>
      ) : (
        /* ── EMPTY STATE ── */
        <div className="p-10 sm:p-14 flex flex-col items-center text-center rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          {/* Visual Illustration */}
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center mb-4 text-[#26332D] shadow-xs">
            <UploadCloud className="w-8 h-8 text-[#26332D]" strokeWidth={1.8} />
          </div>

          <h3 className="text-[20px] font-extrabold text-[#26332D] tracking-tight mb-2">
            No Dataset Uploaded Yet
          </h3>

          <p className="text-[14px] text-[#64736A] max-w-md leading-relaxed mb-6">
            Upload a CSV dataset to activate the intelligence engine — generating statistical profiles, quality issue detection, ML recommendations, and explainability.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={triggerUpload}
              className="btn btn-primary gap-2"
              style={{
                height: "42px",
                paddingInline: "20px",
                fontSize: "13.5px",
                boxShadow: "0 1px 3px rgba(38, 51, 45, 0.08)",
              }}
            >
              <Upload className="w-4 h-4" />
              Upload Dataset
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="btn btn-secondary gap-2"
              style={{ height: "42px", paddingInline: "18px", fontSize: "13.5px" }}
            >
              Explore Profile Workflow
              <ArrowRight className="w-4 h-4 text-[#78827A]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
