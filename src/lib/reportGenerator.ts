import { translations, Lang, TranslationKey } from '../contexts/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportVehicle = {
  vehicleNumber: string;
  vehicleName: string;
  vehicleType: 'metro_train' | 'water_boat';
  currentStatus: string;
  suggestedStatus: string;
  reason: string;
  risk: 'low' | 'medium' | 'high';
  decisionTag?: string;
  confidence?: number;
};

export type ReportDriverShift = {
  driverName: string;
  employeeId: string;
  shift: string;
  vehicle: string;
  route?: string;
};

export type ReportCertAlert = {
  vehicleNumber: string;
  certType: string;
  expiryDate: string;
  daysLeft: number;
  status: 'critical' | 'expiring_soon' | 'valid';
};

export type ReportFeederRoute = {
  routeNumber: string;
  name: string;
  buses: number;
  surgeBuses: number;
  connectsTo: string;
  peakFreqMin: number;
};

export type OperationsReportData = {
  role: 'admin' | 'metro_employee' | 'water_employee';
  reportDate: Date;
  generatedAt: Date;
  generatedBy: string;
  planApproved: boolean;
  approvedAt?: Date;
  aiConfidence?: number;
  demandMultiplier?: number;
  demandLabel?: string;
  surgeMode?: boolean;
  predictedPassengers: number;
  predictedMetroPassengers?: number;
  predictedWaterPassengers?: number;
  metroVehicles: ReportVehicle[];
  waterVehicles: ReportVehicle[];
  metroDrivers: ReportDriverShift[];
  waterDrivers: ReportDriverShift[];
  feederRoutes: ReportFeederRoute[];
  certAlerts: ReportCertAlert[];
  manpowerAvailable: number;
  manpowerRequired: number;
  cleaningBays: number;
  cleaningBaysTotal: number;
  maintenanceTasks: { vehicle: string; task: string; priority: string; due: string }[];
};

// ─── Translation helper ───────────────────────────────────────────────────────

function t(key: TranslationKey, lang: Lang): string {
  return (translations[lang] as Record<string, string>)[key]
    ?? (translations.en as Record<string, string>)[key]
    ?? key;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function statusColor(status: string): string {
  switch (status) {
    case 'service':     return '#16a34a';
    case 'standby':     return '#6b7280';
    case 'maintenance': return '#dc2626';
    case 'cleaning':    return '#d97706';
    case 'ready':       return '#2563eb';
    default:            return '#374151';
  }
}

function statusBg(status: string): string {
  switch (status) {
    case 'service':     return '#f0fdf4';
    case 'standby':     return '#f9fafb';
    case 'maintenance': return '#fef2f2';
    case 'cleaning':    return '#fffbeb';
    case 'ready':       return '#eff6ff';
    default:            return '#f3f4f6';
  }
}

function riskColor(risk: string): string {
  switch (risk) {
    case 'high':   return '#dc2626';
    case 'medium': return '#d97706';
    default:       return '#16a34a';
  }
}

function certStatusColor(s: string): string {
  if (s === 'critical') return '#dc2626';
  if (s === 'expiring_soon') return '#d97706';
  return '#16a34a';
}

// ─── Section renderers ────────────────────────────────────────────────────────

function section(title: string, content: string): string {
  return `
    <div style="margin-bottom:28px;">
      <div style="background:#1e3a5f;color:#fff;padding:8px 16px;border-radius:6px 6px 0 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
        ${title}
      </div>
      <div style="border:1px solid #d1d5db;border-top:none;border-radius:0 0 6px 6px;overflow:hidden;">
        ${content}
      </div>
    </div>
  `;
}

function table(headers: string[], rows: string[][]): string {
  const headerRow = headers.map(h =>
    `<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#374151;background:#f3f4f6;border-bottom:1px solid #d1d5db;white-space:nowrap;">${h}</th>`
  ).join('');
  const bodyRows = rows.map((row, ri) =>
    `<tr style="background:${ri % 2 === 0 ? '#fff' : '#f9fafb'};">` +
    row.map(cell => `<td style="padding:7px 12px;font-size:10px;color:#374151;border-bottom:1px solid #f0f0f0;">${cell}</td>`).join('') +
    `</tr>`
  ).join('');
  return `<table style="width:100%;border-collapse:collapse;">${
    `<thead><tr>${headerRow}</tr></thead>`
  }<tbody>${bodyRows}</tbody></table>`;
}

function metricGrid(items: { label: string; value: string; color?: string }[]): string {
  const cells = items.map(item => `
    <div style="background:${item.color ? item.color + '15' : '#f3f4f6'};border:1px solid ${item.color ? item.color + '40' : '#e5e7eb'};border-radius:8px;padding:12px 14px;text-align:center;">
      <div style="font-size:18px;font-weight:700;color:${item.color ?? '#111827'};">${item.value}</div>
      <div style="font-size:9px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:0.05em;">${item.label}</div>
    </div>
  `).join('');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;padding:16px;">${cells}</div>`;
}

// ─── Vehicle table ────────────────────────────────────────────────────────────

function vehicleTable(vehicles: ReportVehicle[], lang: Lang, showDecisionTag = false): string {
  const headers = [
    t('vehicleNumber', lang),
    t('vehicleName', lang),
    t('assignedStatus', lang),
    t('reason', lang),
    t('risk', lang),
    ...(showDecisionTag ? ['Decision'] : []),
    ...(showDecisionTag ? [t('confidenceScore', lang)] : []),
  ];
  const rows = vehicles.map(v => [
    `<strong>${v.vehicleNumber}</strong>`,
    v.vehicleName,
    `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;font-size:9px;background:${statusBg(v.suggestedStatus)};color:${statusColor(v.suggestedStatus)};border:1px solid ${statusColor(v.suggestedStatus)}40;">${v.suggestedStatus.toUpperCase()}</span>`,
    `<span style="font-size:9px;">${v.reason}</span>`,
    `<span style="font-size:9px;font-weight:600;color:${riskColor(v.risk)};">${v.risk.toUpperCase()}</span>`,
    ...(showDecisionTag ? [v.decisionTag ?? '—'] : []),
    ...(showDecisionTag ? [v.confidence ? `${v.confidence}%` : '—'] : []),
  ]);
  return table(headers, rows);
}

// ─── Driver table ─────────────────────────────────────────────────────────────

function driverTable(drivers: ReportDriverShift[], lang: Lang): string {
  const headers = [t('driver', lang), 'Employee ID', t('shift', lang), t('vehicleNumber', lang), t('route', lang)];
  const rows = drivers.map(d => [
    `<strong>${d.driverName}</strong>`,
    d.employeeId,
    `<span style="font-size:9px;font-weight:600;">${d.shift}</span>`,
    d.vehicle,
    d.route ?? '—',
  ]);
  return table(headers, rows);
}

// ─── Feeder bus table ─────────────────────────────────────────────────────────

function feederTable(routes: ReportFeederRoute[], lang: Lang): string {
  const headers = ['Route No.', t('route', lang), t('buses', lang), 'Surge', t('connects', lang), t('frequency', lang)];
  const rows = routes.map(r => [
    `<strong>${r.routeNumber}</strong>`,
    r.name,
    `${r.buses}`,
    r.surgeBuses > 0 ? `<span style="color:#ea580c;font-weight:700;">+${r.surgeBuses}</span>` : '—',
    r.connectsTo,
    `Every ${r.peakFreqMin} min`,
  ]);
  return table(headers, rows);
}

// ─── Cert alerts table ────────────────────────────────────────────────────────

function certTable(certs: ReportCertAlert[], lang: Lang): string {
  if (!certs.length) {
    return `<div style="padding:14px 16px;font-size:10px;color:#16a34a;">${t('noAlertsToday', lang)}</div>`;
  }
  const headers = [t('vehicleNumber', lang), t('certType', lang), t('expiryDate', lang), t('daysLeft', lang), 'Status'];
  const rows = certs.map(c => {
    const col = certStatusColor(c.status);
    const label = c.status === 'critical' ? t('critical', lang) : c.status === 'expiring_soon' ? t('expiringSoon', lang) : t('valid', lang);
    return [
      `<strong>${c.vehicleNumber}</strong>`,
      c.certType,
      c.expiryDate,
      `${c.daysLeft}`,
      `<span style="font-size:9px;font-weight:700;color:${col};background:${col}18;padding:2px 7px;border-radius:4px;">${label}</span>`,
    ];
  });
  return table(headers, rows);
}

// ─── Maintenance table ────────────────────────────────────────────────────────

function maintenanceTable(tasks: OperationsReportData['maintenanceTasks'], lang: Lang): string {
  const headers = [t('vehicleNumber', lang), t('task', lang), t('priority', lang), t('dueDate', lang)];
  const rows = tasks.map(task => {
    const col = task.priority === 'critical' ? '#dc2626' : task.priority === 'high' ? '#ea580c' : '#d97706';
    return [
      `<strong>${task.vehicle}</strong>`,
      task.task,
      `<span style="font-size:9px;font-weight:700;color:${col};">${task.priority.toUpperCase()}</span>`,
      task.due,
    ];
  });
  return table(headers, rows);
}

// ─── Main HTML generator ──────────────────────────────────────────────────────

export function generateOperationsReport(data: OperationsReportData, lang: Lang): string {
  const isML = lang === 'ml';
  const fontFamily = isML
    ? '"Noto Sans Malayalam", "Manjari", serif, sans-serif'
    : '"Segoe UI", "Inter", Arial, sans-serif';

  const dateStr = data.reportDate.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const genTimeStr = data.generatedAt.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });

  let reportTitle = '';
  let roleLabel = '';
  if (data.role === 'admin') {
    reportTitle = t('adminReportTitle', lang);
    roleLabel = t('roleAdmin', lang);
  } else if (data.role === 'metro_employee') {
    reportTitle = t('metroReportTitle', lang);
    roleLabel = t('roleMetro', lang);
  } else {
    reportTitle = t('waterReportTitle', lang);
    roleLabel = t('roleWater', lang);
  }

  const metroService = data.metroVehicles.filter(v => v.suggestedStatus === 'service').length;
  const metroStandby = data.metroVehicles.filter(v => v.suggestedStatus === 'standby').length;
  const metroMaint   = data.metroVehicles.filter(v => v.suggestedStatus === 'maintenance').length;
  const waterService = data.waterVehicles.filter(v => v.suggestedStatus === 'service').length;
  const waterStandby = data.waterVehicles.filter(v => v.suggestedStatus === 'standby').length;
  const waterMaint   = data.waterVehicles.filter(v => v.suggestedStatus === 'maintenance').length;

  // ── Sections by role ──────────────────────────────────────────────────────

  let body = '';

  // Executive summary (all roles)
  const summaryItems: { label: string; value: string; color?: string }[] = [];

  if (data.role === 'admin' || data.role === 'metro_employee') {
    summaryItems.push(
      { label: `Metro ${t('inService', lang)}`, value: `${metroService}`, color: '#16a34a' },
      { label: `Metro ${t('standby', lang)}`, value: `${metroStandby}`, color: '#6b7280' },
      { label: `Metro ${t('maintenance', lang)}`, value: `${metroMaint}`, color: '#dc2626' },
    );
  }
  if (data.role === 'admin' || data.role === 'water_employee') {
    summaryItems.push(
      { label: `Water ${t('inService', lang)}`, value: `${waterService}`, color: '#0891b2' },
      { label: `Water ${t('standby', lang)}`, value: `${waterStandby}`, color: '#6b7280' },
      { label: `Water ${t('maintenance', lang)}`, value: `${waterMaint}`, color: '#dc2626' },
    );
  }

  if (data.role === 'metro_employee') {
    summaryItems.push(
      { label: t('metroPassengers', lang), value: (data.predictedMetroPassengers ?? Math.round(data.predictedPassengers * 0.88)).toLocaleString('en-IN'), color: '#2563eb' },
      { label: t('totalDrivers', lang), value: `${data.metroDrivers.length}`, color: '#7c3aed' },
      { label: t('activeRoutes', lang), value: `${data.feederRoutes.filter(r => r.connectsTo.toLowerCase().includes('metro')).length}`, color: '#0369a1' },
    );
  } else if (data.role === 'water_employee') {
    summaryItems.push(
      { label: t('waterPassengers', lang), value: (data.predictedWaterPassengers ?? Math.round(data.predictedPassengers * 0.12)).toLocaleString('en-IN'), color: '#0891b2' },
      { label: t('totalDrivers', lang), value: `${data.waterDrivers.length}`, color: '#7c3aed' },
      { label: t('activeRoutes', lang), value: `${data.feederRoutes.filter(r => r.connectsTo.toLowerCase().includes('water')).length}`, color: '#0369a1' },
    );
  } else {
    summaryItems.push(
      { label: t('totalPassengers', lang), value: data.predictedPassengers.toLocaleString('en-IN'), color: '#2563eb' },
      { label: t('totalBuses', lang), value: `${data.feederRoutes.reduce((s, r) => s + r.buses + r.surgeBuses, 0)}`, color: '#ea580c' },
      { label: t('confidenceScore', lang), value: data.aiConfidence ? `${data.aiConfidence}%` : '—', color: '#7c3aed' },
    );
  }

  body += section(t('executiveSummary', lang), metricGrid(summaryItems));

  // Metro train assignments
  if ((data.role === 'admin' || data.role === 'metro_employee') && data.metroVehicles.length) {
    body += section(t('metroTrainAssignments', lang), vehicleTable(data.metroVehicles, lang, data.role === 'admin'));
  }

  // Water boat assignments
  if ((data.role === 'admin' || data.role === 'water_employee') && data.waterVehicles.length) {
    body += section(t('waterBoatAssignments', lang), vehicleTable(data.waterVehicles, lang, data.role === 'admin'));
  }

  // Ridership prediction
  const ridershipItems: { label: string; value: string; color?: string }[] = [];
  if (data.role === 'admin') {
    ridershipItems.push(
      { label: t('metroPassengers', lang), value: (data.predictedMetroPassengers ?? Math.round(data.predictedPassengers * 0.88)).toLocaleString('en-IN'), color: '#2563eb' },
      { label: t('waterPassengers', lang), value: (data.predictedWaterPassengers ?? Math.round(data.predictedPassengers * 0.12)).toLocaleString('en-IN'), color: '#0891b2' },
      { label: t('totalPassengers', lang), value: data.predictedPassengers.toLocaleString('en-IN'), color: '#7c3aed' },
      { label: t('demandMultiplier', lang), value: `×${data.demandMultiplier?.toFixed(2) ?? '1.00'}`, color: data.surgeMode ? '#dc2626' : '#374151' },
      { label: t('surgeMode', lang), value: data.surgeMode ? t('active', lang) : t('inactive', lang), color: data.surgeMode ? '#dc2626' : '#16a34a' },
    );
  } else if (data.role === 'metro_employee') {
    ridershipItems.push(
      { label: t('metroPassengers', lang), value: (data.predictedMetroPassengers ?? Math.round(data.predictedPassengers * 0.88)).toLocaleString('en-IN'), color: '#2563eb' },
      { label: t('peakHour', lang), value: '08:00 – 10:00', color: '#7c3aed' },
      { label: t('demandMultiplier', lang), value: `×${data.demandMultiplier?.toFixed(2) ?? '1.00'}` },
    );
  } else {
    ridershipItems.push(
      { label: t('waterPassengers', lang), value: (data.predictedWaterPassengers ?? Math.round(data.predictedPassengers * 0.12)).toLocaleString('en-IN'), color: '#0891b2' },
      { label: t('peakHour', lang), value: '07:30 – 09:30', color: '#7c3aed' },
      { label: t('demandMultiplier', lang), value: `×${data.demandMultiplier?.toFixed(2) ?? '1.00'}` },
    );
  }
  body += section(t('ridershipPrediction', lang), metricGrid(ridershipItems));

  // Driver allocation
  const showMetroDrivers = data.role === 'admin' || data.role === 'metro_employee';
  const showWaterDrivers = data.role === 'admin' || data.role === 'water_employee';
  if (showMetroDrivers && data.metroDrivers.length) {
    body += section(
      `${t('driverAllocation', lang)} — ${isML ? 'മെട്രോ' : 'Metro'}`,
      driverTable(data.metroDrivers, lang),
    );
  }
  if (showWaterDrivers && data.waterDrivers.length) {
    body += section(
      `${t('driverAllocation', lang)} — ${isML ? 'വാട്ടർ മെട്രോ' : 'Water Metro'}`,
      driverTable(data.waterDrivers, lang),
    );
  }

  // Feeder bus deployment
  const filteredFeeder = data.role === 'metro_employee'
    ? data.feederRoutes.filter(r => r.connectsTo.toLowerCase().includes('metro'))
    : data.role === 'water_employee'
    ? data.feederRoutes.filter(r => r.connectsTo.toLowerCase().includes('water'))
    : data.feederRoutes;

  if (filteredFeeder.length) {
    body += section(
      data.role === 'water_employee' ? t('feederBusConnections', lang) : t('feederBusDeployment', lang),
      feederTable(filteredFeeder, lang),
    );
  }

  // Manpower & cleaning (admin only)
  if (data.role === 'admin') {
    body += section(t('manpowerSummary', lang), metricGrid([
      { label: isML ? 'ജീവനക്കാർ ലഭ്യം' : 'Staff Available', value: `${data.manpowerAvailable}`, color: '#16a34a' },
      { label: isML ? 'ജീവനക്കാർ ആവശ്യം' : 'Staff Required', value: `${data.manpowerRequired}`, color: data.manpowerAvailable < data.manpowerRequired ? '#dc2626' : '#374151' },
      { label: isML ? 'ക്ലീനിംഗ് ബേ (ഉപയോഗത്തിൽ)' : 'Cleaning Bays (Active)', value: `${data.cleaningBays}`, color: '#d97706' },
      { label: isML ? 'ആകെ ബേ' : 'Total Bays', value: `${data.cleaningBaysTotal}` },
    ]));
  }

  // Maintenance alerts
  if (data.maintenanceTasks.length) {
    body += section(t('maintenanceAlerts', lang), maintenanceTable(data.maintenanceTasks, lang));
  }

  // Certificate alerts (admin only)
  if (data.role === 'admin') {
    body += section(t('certAlerts', lang), certTable(data.certAlerts, lang));
  }

  // AI decision summary (admin only)
  if (data.role === 'admin' && data.aiConfidence) {
    const decisionRows = [
      [isML ? 'AI വിശ്വാസ്യത' : 'AI Confidence', `<strong>${data.aiConfidence}%</strong>`],
      [isML ? 'ഡിമാൻഡ് ലേബൽ' : 'Demand Label', data.demandLabel ?? 'Normal Weekday'],
      [isML ? 'ഡിമാൻഡ് മൾട്ടിപ്ലയർ' : 'Demand Multiplier', `×${data.demandMultiplier?.toFixed(2) ?? '1.00'}`],
      [isML ? 'ഫ്ലീറ്റ് ഉപയോഗം' : 'Fleet Utilisation', `${metroService + waterService} / ${data.metroVehicles.length + data.waterVehicles.length} vehicles`],
      [isML ? 'ഫീഡർ ബസ് റൂട്ടുകൾ' : 'Feeder Bus Routes', `${data.feederRoutes.length} routes`],
      [isML ? 'ഡ്രൈവർ വിന്യാസം' : 'Driver Deployment', `${data.metroDrivers.length + data.waterDrivers.length} drivers`],
      [isML ? 'സർജ് മോഡ്' : 'Surge Mode', data.surgeMode ? `<span style="color:#dc2626;font-weight:700;">${isML ? 'സജീവം' : 'ACTIVE'}</span>` : `<span style="color:#16a34a;">${isML ? 'നിഷ്ക്രിയം' : 'INACTIVE'}</span>`],
    ];
    body += section(t('aiDecisionSummary', lang), table(
      [isML ? 'പാരാമീറ്റർ' : 'Parameter', isML ? 'മൂല്യം' : 'Value'],
      decisionRows,
    ));
  }

  // ── Full HTML document ────────────────────────────────────────────────────

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${reportTitle} — ${dateStr}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${fontFamily};
    font-size: 11px;
    color: #1f2937;
    background: #f8fafc;
    padding: 0;
  }
  @media print {
    body { background: #fff; }
    .no-print { display: none !important; }
    @page { margin: 16mm; size: A4 portrait; }
  }
  .page { max-width: 900px; margin: 0 auto; background: #fff; }
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%) rotate(-30deg);
    font-size: 72px;
    font-weight: 900;
    color: rgba(0,58,143,0.04);
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
    letter-spacing: 0.1em;
  }
  .content { position: relative; z-index: 1; padding: 32px; }
</style>
</head>
<body>
<div class="watermark">KMRL CONFIDENTIAL</div>
<div class="page">
  <div class="content">

    <!-- Header Banner -->
    <div style="background:linear-gradient(135deg,#001f4d 0%,#003A8F 100%);color:#fff;padding:22px 28px;border-radius:10px;margin-bottom:24px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:32px;height:32px;background:#E31E24;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0;">K</div>
            <div>
              <div style="font-size:16px;font-weight:800;letter-spacing:0.08em;">KO-NECT</div>
              <div style="font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;">${t('kochiMetroRailLtd', lang)}</div>
            </div>
          </div>
          <div style="font-size:14px;font-weight:700;margin-top:6px;">${reportTitle}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.65);margin-top:3px;">${roleLabel}</div>
        </div>
        <div style="text-align:right;font-size:9px;color:rgba(255,255,255,0.7);">
          <div style="font-weight:700;font-size:11px;color:#fff;">${dateStr}</div>
          <div style="margin-top:4px;">${t('generatedAt', lang)}: ${genTimeStr}</div>
          <div style="margin-top:2px;">${t('generatedBy', lang)}: ${data.generatedBy}</div>
          <div style="margin-top:6px;display:inline-block;padding:3px 10px;border-radius:12px;background:${data.planApproved ? '#16a34a' : '#d97706'};font-weight:700;font-size:9px;letter-spacing:0.05em;">
            ${data.planApproved ? '✓ ' + t('planApproved', lang) : t('planNotApproved', lang)}
            ${data.approvedAt ? ` — ${data.approvedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Confidential bar -->
    <div style="text-align:center;font-size:8px;font-weight:700;letter-spacing:0.15em;color:#6b7280;text-transform:uppercase;margin-bottom:20px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;">
      ${t('kmrlConfidential', lang)} &nbsp;|&nbsp; ${t('authorizedPersonnel', lang)} &nbsp;|&nbsp; ${t('controlCenterKochi', lang)}
    </div>

    ${body}

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:14px;border-top:2px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
      <div style="font-size:8px;color:#9ca3af;">
        <div style="font-weight:700;color:#374151;margin-bottom:1px;">KO-NECT Control System — ${t('kochiMetroRailLtd', lang)}</div>
        <div>${t('kmrlConfidential', lang)}</div>
      </div>
      <div style="font-size:8px;color:#9ca3af;text-align:right;">
        <div>${t('date', lang)}: ${dateStr}</div>
        <div>${t('generatedAt', lang)}: ${genTimeStr}</div>
        <div>© 2026 Kochi Metro Rail Ltd. All rights reserved.</div>
      </div>
    </div>

    <!-- Print button -->
    <div class="no-print" style="margin-top:24px;text-align:center;">
      <button onclick="window.print()" style="background:#003A8F;color:#fff;border:none;padding:10px 28px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;letter-spacing:0.04em;">
        🖨️ ${isML ? 'പ്രിന്റ് / PDF ആയി സേവ് ചെയ്യുക' : 'Print / Save as PDF'}
      </button>
      <button onclick="window.close()" style="background:#f3f4f6;color:#374151;border:none;padding:10px 28px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;margin-left:12px;">
        ${isML ? 'അടയ്ക്കുക' : 'Close'}
      </button>
    </div>

  </div>
</div>
</body>
</html>`;
}

// ─── Download helper ──────────────────────────────────────────────────────────
// Always force-downloads an .html file directly — no popup, no blocked windows.

export function openReportInWindow(data: OperationsReportData, lang: Lang): void {
  const html = generateOperationsReport(data, lang);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const roleSlug = data.role === 'admin' ? 'admin-full' : data.role === 'metro_employee' ? 'metro' : 'water';
  const dateTag = data.reportDate.toLocaleDateString('en-IN').replace(/\//g, '-');
  const filename = `KONECT_OPS_${roleSlug.toUpperCase()}_${dateTag}.html`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
