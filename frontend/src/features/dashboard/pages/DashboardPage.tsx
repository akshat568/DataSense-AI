import { useState } from 'react';
import { DashboardHero } from "../components/DashboardHero";
import { UploadCard } from '../components/UploadCard';
import { DatasetSummary } from '../components/DatasetSummary';
import { DatasetPreviewTable } from '../components/DatasetPreviewTable';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { useDataset } from '../../core/context/DatasetContext';
import { generateDatasetProfile, generateRecommendations } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

import {
  Upload,
  UploadCloud,
  FileSpreadsheet,
  Database,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

/* ── Tiny helper ─────────────────────────────────────────────── */
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
  const navigate = useNavigate();

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
      console.error('Failed to generate AI data', err);
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
    <div className="w-full flex flex-col gap-4 fade-in">

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

      {/* UploadCard moved inside DashboardHero */}

      {/* ═══════════════════════════════════════
          KPI CARDS
          ═══════════════════════════════════════ */}
      
      <DatasetSummary data={datasetInfo} />
      

      {/* ═══════════════════════════════════════
          ANALYSIS PIPELINE
          ═══════════════════════════════════════ */}
      <WorkflowTimeline
        datasetInfo={datasetInfo}
        datasetProfile={datasetProfile}
        datasetRecommendations={datasetRecommendations}
        modelResults={modelResults}
        globalExplanations={globalExplanations}
      />

      {/* ═══════════════════════════════════════
          BOTTOM — Recent Dataset | Dataset Preview
          ═══════════════════════════════════════ */}
      {datasetInfo ? (
        /* ~33% Recent Dataset / ~67% Dataset Preview */
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 mt-1 items-start">

          {/* ── LEFT: Recent Dataset card ── */}
          <div
            className="overflow-hidden flex flex-col"
            style={{
              background: "#1E1F22",
              border: "1px solid #28292E",
              borderRadius: "12px",
              minHeight: "185px",
            }}
          >

            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 pt-4 pb-3"
              style={{ borderBottom: "1px solid #28292E" }}
            >
              <Database
                className="w-[18px] h-[18px] flex-shrink-0"
                style={{ color: "#7C5CFC" }}
                strokeWidth={1.75}
              />
              <span
                className="text-[18px] font-bold leading-none"
                style={{ color: "#E8E9ED" }}
              >
                Recent Dataset
              </span>
            </div>

            {/* File information row */}
            <div
              className="flex items-center px-6 py-5 mt-1"
              style={{ borderBottom: "1px solid #28292E" }}
            >
              {/* Green file icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3"
                style={{
                  background: "rgba(62,207,113,0.08)",
                  border: "1px solid rgba(62,207,113,0.18)",
                }}
              >
                <FileSpreadsheet
                  className="w-5 h-5"
                  style={{ color: "#3ECF71" }}
                  strokeWidth={1.75}
                />
              </div>

              {/* Filename + Active status */}
              <div className="min-w-0 flex-1">
                <p
                  className="text-[16px] font-bold truncate leading-tight"
                  style={{ color: "#E8E9ED" }}
                >
                  {datasetInfo.filename}
                </p>

                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                    style={{ background: "#3ECF71" }}
                  />
                  <span
                    className="text-[13.5px] font-semibold"
                    style={{ color: "#3ECF71" }}
                  >
                    Active
                  </span>
                </div>
              </div>

              {/* Uploaded time */}
              <span
                className="flex-shrink-0 ml-4 mr-2 text-[13px] whitespace-nowrap"
                style={{ color: "#6B6E76" }}
              >
                Uploaded just now
              </span>
            </div>

            {/* Statistics — 4-column single row */}
            <div
              className="grid grid-cols-4"
              style={{ borderBottom: "1px solid #28292E" }}
            >
              {[
                { label: 'ROWS',    value: datasetInfo.rows?.toLocaleString() ?? '—' },
                { label: 'COLUMNS', value: String(datasetInfo.columns ?? '—') },
                { label: 'MEMORY',  value: fmtBytes(datasetInfo.memory_usage) },
                { label: 'FORMAT',  value: 'CSV' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center py-4 px-1"
                  style={{
                    borderRight: i < 3 ? "1px solid #28292E" : "none",
                  }}
                >
                  <p
                    className="text-[18px] font-bold leading-none text-center"
                    style={{
                      color: "#E8E9ED",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {item.value}
                  </p>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.12em] mt-[6px] text-center"
                    style={{ color: "#6B6E76" }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Replace Dataset button */}
            <div className="px-4 py-4">
              <button
                onClick={triggerUpload}
                className="w-full flex items-center justify-center gap-2 transition-all duration-150"
                style={{
                  height: '42px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: '#25262A',
                  border: '1px solid #323338',
                  color: '#9DA0A8',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2D2E33';
                  e.currentTarget.style.borderColor = '#454750';
                  e.currentTarget.style.color = '#E8E9ED';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#25262A';
                  e.currentTarget.style.borderColor = '#323338';
                  e.currentTarget.style.color = '#9DA0A8';
                }}
              >
                <RefreshCw className="w-4 h-4 flex-shrink-0" style={{ color: '#7C5CFC' }} />
                Replace Dataset
              </button>
            </div>
          </div>

          {/* ── RIGHT: Dataset Preview table ── */}
          <DatasetPreviewTable
            preview={datasetInfo?.preview || null}
            dataTypes={datasetInfo?.data_types || null}
            totalRows={datasetInfo?.rows}
          />
        </div>
      ) : (
        /* ── EMPTY STATE ── */
        <div
          className="py-12 px-8 flex flex-col items-center text-center fade-in"
          style={{
            background: "#1E1F22",
            border: "1px solid #28292E",
            borderRadius: "14px",
            minHeight: "280px",
            justifyContent: "center"
          }}
        >
          {/* Icon illustration */}
          <div className="relative mb-4 flex items-center justify-center">
            <div
              className="absolute -left-12 top-3 w-10 h-10 rounded-xl flex items-center justify-center opacity-60"
              style={{
                background: "#25262A",
                border: "1px solid #323338",
              }}
            >
              <Database className="w-5 h-5" style={{ color: "#7C5CFC" }} strokeWidth={1.75} />
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
              style={{
                background: "rgba(124,92,252,0.08)",
                border: "1px solid rgba(124,92,252,0.18)",
              }}
            >
              <UploadCloud className="w-8 h-8" style={{ color: "#7C5CFC" }} strokeWidth={1.5} />
            </div>
            <div
              className="absolute -right-12 top-3 w-10 h-10 rounded-xl flex items-center justify-center opacity-60"
              style={{
                background: "#25262A",
                border: "1px solid #323338",
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "#9DA0A8" }} strokeWidth={1.75} />
            </div>
          </div>

          <h3
            className="text-[19px] font-bold mb-2"
            style={{ color: "#E8E9ED" }}
          >
            No Dataset Uploaded
          </h3>
          <p
            className="text-[14px] max-w-sm leading-relaxed mb-6"
            style={{ color: "#9DA0A8" }}
          >
            Upload a CSV dataset to begin AI-powered profiling, preprocessing recommendations, and automated model training.
          </p>

          <button
            onClick={triggerUpload}
            className="btn btn-primary gap-2"
            style={{ fontSize: '14.5px', height: '44px', paddingInline: '22px' }}
          >
            <Upload className="w-4 h-4" />
            Upload Dataset
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="mt-3.5 text-[14px] flex items-center gap-1.5 transition-colors"
            style={{ color: "#7C5CFC", background: "none", border: "none", cursor: "pointer" }}
          >
            Explore analysis features
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
