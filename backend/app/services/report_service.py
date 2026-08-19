"""
report_service.py
-----------------
Compiles report data from the session store and generates:
  - ReportData (JSON) → consumed by the frontend preview
  - HTML export      → generate_html_report()
  - PDF export       → generate_pdf_report()  (ReportLab Platypus, zero native deps)
"""

import datetime
import io
import os
import re
from typing import Any

from app.services.session_service import get_session
from app.services.profiling_service import generate_profile
from app.services.recommendation_service import generate_recommendations
from app.schemas.report_schema import (
    ReportData, CoverPage, RiskAssessment, RecommendationItem,
    AIRecommendationsSummary, ModelCard, ModelComparison, KeyBusinessDriver,
)

# ── ReportLab imports ────────────────────────────────────────────────────────
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate,
    Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable,
)
from reportlab.platypus.flowables import Flowable

# ─────────────────────────────────────────────────────────────────────────────
# compile_report_data — single source of truth (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
def clean_feature_name(name: str) -> str:
    """Removes preprocessing pipeline prefixes like 'num__' or 'cat__' from feature names."""
    if not name:
        return ""
    return re.sub(r'^(num|cat|date|datetime)__', '', name)


def _format_bytes(b: int) -> str:
    """Convert bytes to a human-readable string."""
    if b < 1024:
        return f"{b} B"
    elif b < 1024 ** 2:
        return f"{b / 1024:.1f} KB"
    elif b < 1024 ** 3:
        return f"{b / (1024 ** 2):.1f} MB"
    return f"{b / (1024 ** 3):.1f} GB"


def compile_report_data(session_id: str) -> ReportData:
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found.")

    # ── Dataset profiling (always available once a file is uploaded) ──────
    content = session.dataframe.to_csv(index=False).encode("utf-8")
    profile_data = generate_profile(content, session.filename)
    rec_data = generate_recommendations(content, session.filename)

    # Normalize the profiling dict for the frontend / HTML / PDF consumers.
    # profiling_service returns data under the "health" key.
    health = profile_data.get("health", {})
    dataset_profiling = {
        "rows": health.get("rows", 0),
        "columns": health.get("columns", 0),
        "missing_cells": health.get("total_missing_cells", 0),
        "memory_usage": _format_bytes(health.get("memory_usage_bytes", 0)),
        "duplicate_rows": health.get("duplicate_rows", 0),
        "numeric_features": health.get("numeric_columns", 0),
        "categorical_features": health.get("categorical_columns", 0),
    }

    # ── Recommendations & risk assessment ────────────────────────────────
    col_recs = rec_data.get("column_recommendations", [])
    crit = sum(1 for r in col_recs if r.get("severity") == "critical")
    high = sum(1 for r in col_recs if r.get("severity") == "high")
    med  = sum(1 for r in col_recs if r.get("severity") == "medium")

    if crit > 0 or high > 3:
        overall_risk = "High Risk"
        readiness    = "Needs Immediate Action"
    elif high > 0 or med > 3:
        overall_risk = "Moderate Risk"
        readiness    = "Proceed with Caution"
    else:
        overall_risk = "Low Risk"
        readiness    = "Ready for Modeling"

    risk_assessment = RiskAssessment(
        critical_issues=crit,
        high_issues=high,
        medium_issues=med,
        overall_risk=overall_risk,
    )

    immediate, future = [], []
    for r in col_recs:
        item = RecommendationItem(
            column=clean_feature_name(r.get("column_name", "Unknown")),
            issue=r.get("issue", ""),
            action=r.get("recommendation", ""),
            severity=r.get("severity", "info"),
            confidence=r.get("confidence_score", 0.0),
            reason=r.get("reason", "")
        )
        (immediate if r.get("severity") in ("critical", "high") else future).append(item)

    recommendations_summary = AIRecommendationsSummary(
        risk_assessment=risk_assessment,
        immediate_actions=immediate,
        future_improvements=future,
    )

    # ── Models section (optional — graceful degradation) ─────────────────
    has_models = bool(session.best_model and session.metrics)

    if has_models:
        primary_metric_key = "r2_score" if "Regression" in (session.ml_task or "") else "f1_score"

        cv_results = session.cv_results or {}
        model_times = session.model_training_times or {}

        model_keys = list((session.metrics or {}).keys())
        best_key = model_keys[0] if model_keys else type(session.best_model).__name__
        for k, v in (session.all_models or {}).items():
            if v is session.best_model:
                best_key = k
                break

        # Check if there is a tie at the top for the primary metric
        best_val = (session.metrics or {}).get(best_key, {}).get(primary_metric_key, 0.0)
        tied_models_keys = [
            m for m in model_keys
            if abs((session.metrics or {}).get(m, {}).get(primary_metric_key, 0.0) - best_val) < 1e-4
        ]
        has_tie = len(tied_models_keys) > 1

        def _create_model_card(model_name: str) -> ModelCard:
            m_data = (session.metrics or {}).get(model_name, {})
            cv_data = cv_results.get(model_name, {})
            val = m_data.get(primary_metric_key, 0.0)
            
            if model_name == best_key:
                if has_tie:
                    description = (
                        f"All evaluated models achieved the same {primary_metric_key.upper().replace('_', ' ')}. "
                        f"{model_name} was selected because it achieved the highest cross-validation mean."
                    )
                else:
                    description = (
                        f"{model_name} achieved the highest {primary_metric_key.upper().replace('_', ' ')} "
                        f"among the evaluated baseline models. Further validation and tuning are recommended "
                        f"before production deployment."
                    )
            else:
                description = f"Automated baseline model trained for {session.ml_task}"
                
            return ModelCard(
                name=model_name,
                description=description,
                primary_metric=primary_metric_key.upper().replace("_", " "),
                primary_metric_value=float(val),
                cv_mean=float(cv_data.get("mean_score", 0.0)),
                cv_std=float(cv_data.get("std_score", 0.0)),
                training_time=float(model_times.get(model_name, 0.0)),
                hyperparameters="Default Scikit-Learn parameters",
            )

        best_card = _create_model_card(best_key)

        sorted_models = sorted(
            [k for k in model_keys if k != best_key],
            key=lambda x: (session.metrics or {}).get(x, {}).get(primary_metric_key, 0.0),
            reverse=True,
        )
        runner_up_card = (
            _create_model_card(sorted_models[0])
            if sorted_models else None
        )

        models = ModelComparison(
            best_model=best_card,
            runner_up=runner_up_card,
            all_metrics=[{
                "name": m,
                "metrics": session.metrics[m],
                "cv_mean": float(cv_results.get(m, {}).get("mean_score", 0.0)),
                "cv_std": float(cv_results.get(m, {}).get("std_score", 0.0)),
                "training_time": float(model_times.get(m, 0.0)),
                "is_best": m == best_key
            } for m in model_keys],
        )
    else:
        # No models trained yet — provide a placeholder so the schema is valid.
        models = ModelComparison(
            best_model=ModelCard(
                name="Not Available",
                description="Baseline models have not been trained yet.",
                primary_metric="N/A",
                primary_metric_value=0.0,
                cv_mean=0.0,
                cv_std=0.0,
                training_time=0.0,
                hyperparameters="N/A",
            ),
            runner_up=None,
            all_metrics=[],
        )
        primary_metric_key = "f1_score"
        best_key = "N/A"

    # ── Explainability / Key Business Drivers (optional) ─────────────────
    has_shap = bool(session.global_shap_values)

    if has_shap:
        drivers = [
            KeyBusinessDriver(
                feature=clean_feature_name(feat["feature"]),
                importance=feat["importance"],
                direction="Mixed/Absolute",
            )
            for feat in (session.global_shap_values or [])[:10]
        ]
    else:
        drivers = []

    # ── Executive Summary ────────────────────────────────────────────────
    model_count = len((session.metrics or {}).keys()) if has_models else 0
    target_name = session.detected_target or "unknown"

    exec_parts = [
        f"DataSense AI analyzed the dataset '{session.filename}', containing "
        f"{dataset_profiling['rows']} rows and {dataset_profiling['columns']} columns.",
        f"The platform automatically diagnosed data health, recommending "
        f"{len(immediate)} immediate actions.",
    ]
    if has_models:
        exec_parts.append(
            f"A total of {model_count} baseline models were trained targeting '{target_name}'."
        )
    else:
        exec_parts.append("Baseline models have not been trained for this session.")

    exec_summary = " ".join(exec_parts)

    # ── AI Conclusion ────────────────────────────────────────────────────
    if has_models and has_shap:
        best_card_ref = models.best_model
        top_driver = drivers[0].feature if drivers else "Unknown"
        ai_conclusion = (
            f"The dataset is {overall_risk.lower()}. The {best_key} model successfully "
            f"established a baseline {best_card_ref.primary_metric} of "
            f"{best_card_ref.primary_metric_value:.4f}. The most influential feature "
            f"influencing this target is {top_driver}. "
            f"Proceed with the immediate preprocessing actions to improve model robustness "
            f"before advancing to hyperparameter tuning or deep learning phases."
        )
    elif has_models:
        best_card_ref = models.best_model
        ai_conclusion = (
            f"The dataset is {overall_risk.lower()}. The {best_key} model established a baseline "
            f"{best_card_ref.primary_metric} of {best_card_ref.primary_metric_value:.4f}. "
            f"Run Explainability (SHAP) to identify the key influential features."
        )
    else:
        ai_conclusion = (
            f"The dataset is {overall_risk.lower()}. Train baseline models and run "
            f"Explainability to complete the analysis pipeline."
        )

    # ── Workflow Timeline ────────────────────────────────────────────────
    timeline = [
        "Data Ingestion & Integrity Check",
        "Statistical Profiling",
        "Rule-Based Anomaly Detection",
        "Automated Preprocessing & Imputation",
    ]
    if has_models:
        timeline.append("Baseline Model Training & Cross Validation")
    if has_shap:
        timeline.append("SHAP Value Extraction")
    timeline.append("Final Report Generation")

    cover = CoverPage(
        title="AI Dataset Intelligence Report",
        subtitle=f"Analysis of {session.filename}",
        dataset_readiness=readiness,
        date=datetime.datetime.now().strftime("%B %d, %Y"),
        workflow_timeline=timeline,
    )

    return ReportData(
        session_id=session_id,
        cover_page=cover,
        executive_summary=exec_summary,
        dataset_profiling=dataset_profiling,
        recommendations=recommendations_summary,
        models=models,
        key_business_drivers=drivers,
        ai_conclusion=ai_conclusion,
        appendix={
            "ml_task": session.ml_task or "Not determined",
            "target_column": session.detected_target or "Not determined",
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
# HTML export (standalone — no WeasyPrint, plain string template)
# ─────────────────────────────────────────────────────────────────────────────
def _html_table_rows(rows: list, cols: list) -> str:
    header = "".join(f"<th>{c}</th>" for c in cols)
    body   = ""
    for r in rows:
        body += "<tr>" + "".join(f"<td>{r.get(c, '')}</td>" for c in cols) + "</tr>"
    return f"<table><thead><tr>{header}</tr></thead><tbody>{body}</tbody></table>"


def generate_html_report(report_data: ReportData) -> str:
    """Returns a self-contained HTML string — no WeasyPrint, no Jinja2."""
    d    = report_data
    cp   = d.cover_page
    recs = d.recommendations
    bm   = d.models.best_model

    immediate_rows = [
        {"Feature": r.column, "Issue": r.issue, "Recommended Action": r.action}
        for r in recs.immediate_actions
    ]
    future_rows = [
        {"Feature": r.column, "Issue": r.issue, "Recommended Action": r.action}
        for r in recs.future_improvements
    ]
    driver_rows = [
        {"#": i + 1, "Feature": dr.feature, "Importance": f"{dr.importance:.4f}"}
        for i, dr in enumerate(d.key_business_drivers)
    ]
    timeline_items = "".join(
        f'<li>{step}</li>' for step in cp.workflow_timeline
    )

    immediate_html = (
        _html_table_rows(immediate_rows, ["Feature", "Issue", "Recommended Action"])
        if immediate_rows else "<p>No immediate actions required.</p>"
    )
    future_html = (
        _html_table_rows(future_rows, ["Feature", "Issue", "Recommended Action"])
        if future_rows else "<p>No secondary improvements identified.</p>"
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{cp.title}</title>
  <style>
    body{{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111827;line-height:1.6;margin:0;padding:40px;font-size:14px;}}
    h1{{font-size:28px;font-weight:700;margin:0 0 8px;}}
    h2{{font-size:18px;font-weight:600;color:#4F46E5;border-bottom:2px solid #E5E7EB;padding-bottom:6px;margin:32px 0 12px;}}
    h3{{font-size:14px;font-weight:600;color:#374151;margin:20px 0 8px;}}
    p{{margin:0 0 10px;color:#4B5563;}}
    .subtitle{{font-size:16px;color:#6B7280;margin-bottom:12px;}}
    .badge{{display:inline-block;padding:4px 12px;background:#EEF2FF;color:#4338CA;border:1px solid #C7D2FE;border-radius:4px;font-weight:600;font-size:12px;}}
    .date{{font-size:12px;color:#9CA3AF;margin-top:8px;}}
    table{{width:100%;border-collapse:collapse;margin:12px 0 20px;font-size:13px;}}
    th{{background:#F9FAFB;color:#374151;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.05em;padding:8px 12px;border:1px solid #E5E7EB;text-align:left;}}
    td{{padding:8px 12px;border:1px solid #E5E7EB;color:#4B5563;}}
    tr:nth-child(even){{background:#F9FAFB;}}
    .kpi-grid{{display:flex;gap:16px;margin:12px 0 20px;flex-wrap:wrap;}}
    .kpi{{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:12px 16px;min-width:120px;}}
    .kpi-label{{font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;}}
    .kpi-value{{font-size:20px;font-weight:700;color:#111827;margin-top:4px;}}
    .model-card{{border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:12px 0 20px;}}
    .model-name{{font-size:18px;font-weight:700;color:#111827;margin:0 0 4px;}}
    .model-desc{{font-size:13px;color:#6B7280;margin:0 0 12px;}}
    ol{{padding-left:20px;margin:8px 0 0;}}
    li{{padding:3px 0;color:#4B5563;}}
    .highlight{{background:#F0FDF4;border-left:4px solid #059669;padding:12px 16px;border-radius:0 6px 6px 0;color:#065F46;font-size:13px;}}
    footer{{margin-top:40px;border-top:1px solid #E5E7EB;padding-top:12px;font-size:11px;color:#9CA3AF;text-align:center;}}
    @media print{{body{{padding:20px;}}.page-break{{page-break-before:always;}}}}
  </style>
</head>
<body>

  <h1>{cp.title}</h1>
  <div class="subtitle">{cp.subtitle}</div>
  <span class="badge">Readiness: {cp.dataset_readiness}</span>
  <div class="date">{cp.date}</div>

  <h2>Workflow Timeline</h2>
  <ol>{timeline_items}</ol>

  <div class="page-break"></div>

  <h2>1. Executive Summary</h2>
  <p>{d.executive_summary}</p>

  <h2>2. Dataset Profiling Summary</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Rows</div><div class="kpi-value">{d.dataset_profiling.get('rows', 'N/A')}</div></div>
    <div class="kpi"><div class="kpi-label">Columns</div><div class="kpi-value">{d.dataset_profiling.get('columns', 'N/A')}</div></div>
    <div class="kpi"><div class="kpi-label">Missing Cells</div><div class="kpi-value">{d.dataset_profiling.get('missing_cells', 'N/A')}</div></div>
    <div class="kpi"><div class="kpi-label">Memory Usage</div><div class="kpi-value">{d.dataset_profiling.get('memory_usage', 'N/A')}</div></div>
  </div>

  <h2>3. Risk Assessment</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Overall Risk</div><div class="kpi-value" style="font-size:14px;">{recs.risk_assessment.overall_risk}</div></div>
    <div class="kpi"><div class="kpi-label">Critical</div><div class="kpi-value" style="color:#DC2626;">{recs.risk_assessment.critical_issues}</div></div>
    <div class="kpi"><div class="kpi-label">High</div><div class="kpi-value" style="color:#D97706;">{recs.risk_assessment.high_issues}</div></div>
    <div class="kpi"><div class="kpi-label">Medium</div><div class="kpi-value">{recs.risk_assessment.medium_issues}</div></div>
  </div>

  <h2>4. AI Recommendations</h2>
  <h3>Immediate Actions (Critical &amp; High)</h3>
  {immediate_html}
  <h3>Future Improvements (Medium &amp; Low)</h3>
  {future_html}

  <div class="page-break"></div>

  <h2>5. Model Card</h2>
  <div class="model-card">
    <div style="font-size:11px;font-weight:700;color:#D97706;text-transform:uppercase;margin-bottom:6px;">&#127942; Selected Baseline Model</div>
    <div class="model-name">{bm.name}</div>
    <div class="model-desc">{bm.description}</div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">{bm.primary_metric}</div><div class="kpi-value" style="color:#059669;">{bm.primary_metric_value:.4f}</div></div>
      <div class="kpi"><div class="kpi-label">Training Time</div><div class="kpi-value">{bm.training_time:.2f}s</div></div>
    </div>
  </div>

  <h2>6. Key Influential Features</h2>
  {_html_table_rows(driver_rows, ['#', 'Feature', 'Importance'])}

  <h2>7. AI Conclusion</h2>
  <div class="highlight">{d.ai_conclusion}</div>

  <h2>8. Appendix — Job Metadata</h2>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Session ID</td><td>{d.session_id}</td></tr>
    <tr><td>Report Generated</td><td>{cp.date}</td></tr>
    <tr><td>Target Column</td><td>{d.appendix.get('target_column', 'N/A')}</td></tr>
    <tr><td>ML Task</td><td>{d.appendix.get('ml_task', 'N/A')}</td></tr>
  </table>

  <footer>Generated by DataSense AI &nbsp;|&nbsp; v1.0 &nbsp;|&nbsp; {cp.date}</footer>
</body>
</html>"""


# ─────────────────────────────────────────────────────────────────────────────
# PDF export — ReportLab Platypus (zero native dependencies)
# ─────────────────────────────────────────────────────────────────────────────

# Colour palette
_INDIGO   = colors.HexColor("#4F46E5")
_DARK     = colors.HexColor("#111827")
_MID      = colors.HexColor("#4B5563")
_LIGHT    = colors.HexColor("#6B7280")
_MUTED    = colors.HexColor("#9CA3AF")
_BORDER   = colors.HexColor("#E5E7EB")
_BG_SUBTLE= colors.HexColor("#F9FAFB")
_SUCCESS  = colors.HexColor("#059669")
_DANGER   = colors.HexColor("#DC2626")
_WARNING  = colors.HexColor("#D97706")
_GOLD     = colors.HexColor("#D97706")
_INDIGO_SUBTLE = colors.HexColor("#EEF2FF")
_GREEN_SUBTLE  = colors.HexColor("#F0FDF4")


def _build_styles() -> dict:
    base = getSampleStyleSheet()
    return {
        "report_title": ParagraphStyle(
            "report_title",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=30,
            textColor=_DARK,
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=13,
            textColor=_LIGHT,
            spaceAfter=8,
        ),
        "section_heading": ParagraphStyle(
            "section_heading",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=14,
            textColor=_INDIGO,
            spaceBefore=22,
            spaceAfter=8,
        ),
        "sub_heading": ParagraphStyle(
            "sub_heading",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=_DARK,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=_MID,
            leading=15,
            spaceAfter=6,
        ),
        "highlight": ParagraphStyle(
            "highlight",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#065F46"),
            leading=15,
            leftIndent=10,
            rightIndent=10,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=_MUTED,
            alignment=TA_CENTER,
        ),
        "badge": ParagraphStyle(
            "badge",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=_INDIGO,
        ),
        "model_name": ParagraphStyle(
            "model_name",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=15,
            textColor=_DARK,
            spaceAfter=4,
        ),
        "kpi_label": ParagraphStyle(
            "kpi_label",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=_LIGHT,
        ),
        "kpi_value": ParagraphStyle(
            "kpi_value",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=_DARK,
        ),
        "timeline_item": ParagraphStyle(
            "timeline_item",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=_MID,
            leftIndent=12,
            spaceAfter=5,
        ),
        "table_header": ParagraphStyle(
            "table_header",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=_MID,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=_MID,
        ),
    }


_DEFAULT_TABLE_STYLE = TableStyle([
    ("BACKGROUND",  (0, 0), (-1, 0),  _BG_SUBTLE),
    ("TEXTCOLOR",   (0, 0), (-1, 0),  _MID),
    ("FONTNAME",    (0, 0), (-1, 0),  "Helvetica-Bold"),
    ("FONTSIZE",    (0, 0), (-1, 0),  9),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _BG_SUBTLE]),
    ("FONTNAME",    (0, 1), (-1, -1), "Helvetica"),
    ("FONTSIZE",    (0, 1), (-1, -1), 9),
    ("TEXTCOLOR",   (0, 1), (-1, -1), _MID),
    ("GRID",        (0, 0), (-1, -1), 0.5, _BORDER),
    ("TOPPADDING",  (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING",(0, 0), (-1, -1), 8),
    ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
])


def _kpi_table(kpis: list[tuple[str, str]], col_widths: list) -> Table:
    """Renders a row of KPI boxes: [(label, value), ...]"""
    labels = [Paragraph(l, _STYLES["kpi_label"]) for l, _ in kpis]
    values = [Paragraph(v, _STYLES["kpi_value"])  for _, v in kpis]

    tbl = Table([labels, values], colWidths=col_widths)
    tbl.setStyle(TableStyle([
        ("BOX",          (0, 0), (-1, -1), 0.5, _BORDER),
        ("LINEAFTER",    (0, 0), (-2, -1), 0.5, _BORDER),
        ("BACKGROUND",   (0, 0), (-1, -1), _BG_SUBTLE),
        ("TOPPADDING",   (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
        ("LEFTPADDING",  (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return tbl


def _section_rule(width: float = 17 * cm) -> HRFlowable:
    return HRFlowable(width=width, thickness=1, color=_BORDER, spaceAfter=4, spaceBefore=0)


def _build_footer_canvas(canvas, doc):
    """Called on every page — draws the persistent footer."""
    canvas.saveState()
    page_width, _ = A4
    footer_y = 15 * mm

    # Separator line
    canvas.setStrokeColor(_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, footer_y + 4 * mm, page_width - doc.rightMargin, footer_y + 4 * mm)

    # Footer text — left
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(_MUTED)
    canvas.drawString(doc.leftMargin, footer_y, "Generated by DataSense AI  |  v1.0")

    # Footer text — right: page number
    canvas.drawRightString(
        page_width - doc.rightMargin,
        footer_y,
        f"Page {canvas.getPageNumber()}  |  {datetime.datetime.now().strftime('%Y-%m-%d %H:%M UTC')}",
    )
    canvas.restoreState()


# Pre-build styles once (module-level for reuse)
_STYLES: dict = {}


def _get_styles() -> dict:
    global _STYLES
    if not _STYLES:
        _STYLES = _build_styles()
    return _STYLES


def generate_pdf_report(report_data: ReportData) -> bytes:
    """
    Build a professional consulting-grade PDF from ReportData using
    ReportLab Platypus only — no GTK, Pango, Cairo, or WeasyPrint required.
    """
    S = _get_styles()
    buf = io.BytesIO()

    doc = BaseDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2.5 * cm,
    )

    content_width = doc.width   # usable body width
    frame = Frame(
        doc.leftMargin, doc.bottomMargin,
        content_width, doc.height,
        id="main",
    )
    doc.addPageTemplates([
        PageTemplate(id="main", frames=frame, onPage=_build_footer_canvas)
    ])

    story = []
    d = report_data
    cp = d.cover_page
    recs = d.recommendations
    bm = d.models.best_model
    H4 = content_width / 4 - 2 * mm   # quarter-width column

    # ── COVER PAGE ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 2 * cm))
    story.append(Paragraph(cp.title, S["report_title"]))
    story.append(Paragraph(cp.subtitle, S["subtitle"]))

    # Readiness badge (coloured box)
    badge_color = (
        colors.HexColor("#FEF2F2") if "High" in cp.dataset_readiness
        else colors.HexColor("#FFFBEB") if "Caution" in cp.dataset_readiness
        else _GREEN_SUBTLE
    )
    badge_text_color = (
        _DANGER if "High" in cp.dataset_readiness
        else _WARNING if "Caution" in cp.dataset_readiness
        else _SUCCESS
    )
    readiness_tbl = Table(
        [[Paragraph(f"Readiness: {cp.dataset_readiness}", ParagraphStyle(
            "badge_inline", parent=S["body"],
            textColor=badge_text_color, fontName="Helvetica-Bold", fontSize=10,
        ))]],
        colWidths=[8 * cm],
    )
    readiness_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), badge_color),
        ("BOX",        (0, 0), (-1, -1), 0.75, badge_text_color),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(readiness_tbl)
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(cp.date, S["body"]))

    # Workflow Timeline
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph("Workflow Timeline", S["sub_heading"]))
    _section_rule(content_width)
    for i, step in enumerate(cp.workflow_timeline, 1):
        story.append(Paragraph(f"{i}. {step}", S["timeline_item"]))

    story.append(PageBreak())

    # ── SECTION 1: EXECUTIVE SUMMARY ────────────────────────────────────────
    story.append(Paragraph("01  Executive Summary", S["section_heading"]))
    _section_rule(content_width)
    story.append(Paragraph(d.executive_summary, S["body"]))

    # ── SECTION 2: DATASET PROFILING ────────────────────────────────────────
    story.append(Paragraph("02  Dataset Profiling Summary", S["section_heading"]))
    _section_rule(content_width)

    prof = d.dataset_profiling
    story.append(_kpi_table(
        [
            ("Rows",          str(prof.get("rows", "N/A"))),
            ("Columns",       str(prof.get("columns", "N/A"))),
            ("Missing Cells", str(prof.get("missing_cells", "N/A"))),
            ("Memory Usage",  str(prof.get("memory_usage", "N/A"))),
        ],
        [H4, H4, H4, H4],
    ))

    # ── SECTION 3: RISK ASSESSMENT ──────────────────────────────────────────
    story.append(Paragraph("03  Risk Assessment", S["section_heading"]))
    _section_rule(content_width)

    risk_val_style = ParagraphStyle(
        "risk_val", parent=S["kpi_value"], fontSize=20,
        textColor=(_DANGER if "High" in recs.risk_assessment.overall_risk
                   else _WARNING if "Moderate" in recs.risk_assessment.overall_risk
                   else _SUCCESS),
    )
    story.append(Table(
        [
            [
                Paragraph("Overall Risk",   S["kpi_label"]),
                Paragraph("Critical",       S["kpi_label"]),
                Paragraph("High",           S["kpi_label"]),
                Paragraph("Medium",         S["kpi_label"]),
            ],
            [
                Paragraph(recs.risk_assessment.overall_risk, risk_val_style),
                Paragraph(str(recs.risk_assessment.critical_issues), ParagraphStyle("rv", parent=S["kpi_value"], fontSize=20, textColor=_DANGER)),
                Paragraph(str(recs.risk_assessment.high_issues),     ParagraphStyle("rv", parent=S["kpi_value"], fontSize=20, textColor=_WARNING)),
                Paragraph(str(recs.risk_assessment.medium_issues),   S["kpi_value"]),
            ],
        ],
        colWidths=[H4 * 1.5, H4 * 0.83, H4 * 0.83, H4 * 0.83],
        style=TableStyle([
            ("BACKGROUND",   (0, 0), (-1, -1), _BG_SUBTLE),
            ("BOX",          (0, 0), (-1, -1), 0.5, _BORDER),
            ("LINEAFTER",    (0, 0), (-2, -1), 0.5, _BORDER),
            ("TOPPADDING",   (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 8),
            ("LEFTPADDING",  (0, 0), (-1, -1), 10),
        ]),
    ))

    # ── SECTION 4: AI RECOMMENDATIONS ───────────────────────────────────────
    story.append(Paragraph("04  AI Recommendations", S["section_heading"]))
    _section_rule(content_width)

    def _rec_table(items, title: str):
        story.append(Paragraph(title, S["sub_heading"]))
        if not items:
            story.append(Paragraph("No items in this category.", S["body"]))
            return
        col_w = [4 * cm, 5 * cm, content_width - 9 * cm]
        rows  = [["Feature", "Issue", "Recommended Action"]] + [
            [
                Paragraph(r.column, S["table_cell"]),
                Paragraph(r.issue,  S["table_cell"]),
                Paragraph(r.action, S["table_cell"]),
            ]
            for r in items
        ]
        tbl = Table(rows, colWidths=col_w, repeatRows=1)
        tbl.setStyle(_DEFAULT_TABLE_STYLE)
        story.append(tbl)

    _rec_table(recs.immediate_actions, "Immediate Actions (Critical & High)")
    _rec_table(recs.future_improvements, "Future Improvements (Medium & Low)")

    story.append(PageBreak())

    # ── SECTION 5: MODEL CARD ───────────────────────────────────────────────
    story.append(Paragraph("05  Model Card", S["section_heading"]))
    _section_rule(content_width)

    card_rows = [
        [Paragraph("🏆 Selected Baseline Model", ParagraphStyle(
            "gold", parent=S["body"], textColor=_GOLD, fontName="Helvetica-Bold", fontSize=9
        ))],
        [Paragraph(bm.name, S["model_name"])],
        [Paragraph(bm.description, S["body"])],
    ]
    card_tbl = Table(card_rows, colWidths=[content_width])
    card_tbl.setStyle(TableStyle([
        ("BOX",          (0, 0), (-1, -1), 0.75, _BORDER),
        ("TOPPADDING",   (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
        ("LEFTPADDING",  (0, 0), (-1, -1), 12),
    ]))
    story.append(card_tbl)
    story.append(_kpi_table(
        [
            (bm.primary_metric, f"{bm.primary_metric_value:.4f}"),
            ("Training Time",   f"{bm.training_time:.2f}s"),
        ],
        [content_width / 2, content_width / 2],
    ))

    # ── SECTION 6: KEY INFLUENTIAL FEATURES ───────────────────────────────────
    story.append(Paragraph("06  Key Influential Features", S["section_heading"]))
    _section_rule(content_width)
    story.append(Paragraph(
        "Features ranked by mean absolute SHAP value — higher values indicate greater model influence.",
        S["body"],
    ))

    driver_col_w = [1.2 * cm, content_width - 1.2 * cm - 4 * cm, 4 * cm]
    driver_rows  = [["#", "Feature", "Importance"]] + [
        [str(i + 1), d.feature, f"{d.importance:.4f}"]
        for i, d in enumerate(d.key_business_drivers)
    ]
    driver_tbl = Table(driver_rows, colWidths=driver_col_w, repeatRows=1)
    driver_tbl.setStyle(TableStyle([
        *_DEFAULT_TABLE_STYLE._cmds,
        ("TEXTCOLOR", (2, 1), (2, -1), _INDIGO),
        ("FONTNAME",  (2, 1), (2, -1), "Helvetica-Bold"),
    ]))
    story.append(driver_tbl)

    # ── SECTION 7: AI CONCLUSION ─────────────────────────────────────────────
    story.append(Paragraph("07  AI Conclusion", S["section_heading"]))
    _section_rule(content_width)

    conclusion_tbl = Table(
        [[Paragraph(d.ai_conclusion, S["highlight"])]],
        colWidths=[content_width],
    )
    conclusion_tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), _GREEN_SUBTLE),
        ("LINEBEFORE",   (0, 0), (0, -1),  4, _SUCCESS),
        ("TOPPADDING",   (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 10),
        ("LEFTPADDING",  (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(conclusion_tbl)

    story.append(PageBreak())

    # ── SECTION 8: APPENDIX ──────────────────────────────────────────────────
    story.append(Paragraph("08  Appendix — Job Metadata", S["section_heading"]))
    _section_rule(content_width)

    meta_rows = [
        ["Field", "Value"],
        ["Session ID",     d.session_id],
        ["Report Date",    cp.date],
        ["Target Column",  d.appendix.get("target_column", "N/A")],
        ["ML Task",        d.appendix.get("ml_task", "N/A")],
    ]
    meta_tbl = Table(meta_rows, colWidths=[5 * cm, content_width - 5 * cm])
    meta_tbl.setStyle(_DEFAULT_TABLE_STYLE)
    story.append(meta_tbl)

    # ── BUILD PDF ─────────────────────────────────────────────────────────────
    doc.build(story)
    return buf.getvalue()
