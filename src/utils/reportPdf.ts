import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { CATEGORIES } from '../config/categories';
import { ReportData } from '../types';
import { generateNarrative } from './reportGenerator';

function getCategoryColor(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.color ?? '#E0E0E0';
}

function getCategoryName(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

function getCategoryIcon(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.icon ?? '';
}

function buildCategoryBars(data: ReportData): string {
  const maxCount = Math.max(
    ...Object.values(data.entries_by_category),
    1
  );

  return Object.entries(data.entries_by_category)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([catId, count]) => {
      const width = Math.max((count / maxCount) * 100, 8);
      const color = getCategoryColor(catId);
      const name = getCategoryName(catId);
      const icon = getCategoryIcon(catId);
      return `
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="font-family: 'Nunito', sans-serif; font-size: 13px; color: #4A4A4A;">${icon} ${name}</span>
            <span style="font-family: 'Nunito', sans-serif; font-size: 13px; color: #8B7E6A; font-weight: bold;">${count}</span>
          </div>
          <div style="background: #F5F0E8; border-radius: 6px; height: 18px; overflow: hidden;">
            <div style="background: ${color}; height: 100%; width: ${width}%; border-radius: 6px; border: 1px solid rgba(0,0,0,0.08);"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

function buildMilestonesList(data: ReportData): string {
  if (data.milestones_reached.length === 0) {
    return '<p style="font-family: \'Nunito\', sans-serif; color: #8B7E6A; font-style: italic;">No new milestones this period</p>';
  }

  return data.milestones_reached
    .map((m) => {
      const parts = m.split(':');
      const skillId = parts[0];
      const milestoneKey = parts[1] ?? '';
      return `
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 16px; margin-right: 8px;">&#11088;</span>
          <span style="font-family: 'Nunito', sans-serif; font-size: 13px; color: #4A4A4A;">
            ${skillId.replace(/_/g, ' ')} - ${milestoneKey.replace(/_/g, ' ')}
          </span>
        </div>
      `;
    })
    .join('');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildReportHtml(
  childName: string,
  reportType: string,
  periodStart: string,
  periodEnd: string,
  data: ReportData
): string {
  const narrative = generateNarrative(childName, data);
  const typeBadgeColor =
    reportType === 'weekly'
      ? '#5B9BD5'
      : reportType === 'monthly'
        ? '#9B72CF'
        : '#6BBF6B';
  const typeLabel =
    reportType.charAt(0).toUpperCase() + reportType.slice(1);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Nunito', sans-serif;
          background: #FFF8F0;
          color: #4A4A4A;
          padding: 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px dashed rgba(173, 206, 240, 0.5);
        }
        .child-name {
          font-family: 'Gaegu', cursive;
          font-size: 32px;
          font-weight: 700;
          color: #4A4A4A;
          margin-bottom: 4px;
        }
        .period {
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: #8B7E6A;
          margin-bottom: 8px;
        }
        .badge {
          display: inline-block;
          background: ${typeBadgeColor};
          color: white;
          padding: 4px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
        .section {
          margin-bottom: 24px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .section-title {
          font-family: 'Gaegu', cursive;
          font-size: 22px;
          font-weight: 700;
          color: #8B7355;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(210, 180, 140, 0.4);
        }
        .stat-grid {
          display: flex;
          justify-content: space-around;
          text-align: center;
          margin-bottom: 8px;
        }
        .stat-item .number {
          font-family: 'Gaegu', cursive;
          font-size: 36px;
          font-weight: 700;
          color: #5B9BD5;
        }
        .stat-item .label {
          font-size: 12px;
          color: #8B7E6A;
          font-weight: 600;
        }
        .narrative {
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #4A4A4A;
          padding: 12px 16px;
          background: repeating-linear-gradient(
            transparent,
            transparent 27px,
            rgba(173, 206, 240, 0.3) 27px,
            rgba(173, 206, 240, 0.3) 28px
          );
          border-left: 2px solid rgba(228, 93, 93, 0.3);
          min-height: 60px;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 16px;
          border-top: 2px dashed rgba(173, 206, 240, 0.5);
          font-size: 12px;
          color: #B0A89A;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="child-name">${childName}'s Learning Report</div>
        <div class="period">${formatDate(periodStart)} - ${formatDate(periodEnd)}</div>
        <span class="badge">${typeLabel} Report</span>
      </div>

      <div class="section">
        <div class="stat-grid">
          <div class="stat-item">
            <div class="number">${data.total_entries}</div>
            <div class="label">Entries</div>
          </div>
          <div class="stat-item">
            <div class="number">${data.xp_earned}</div>
            <div class="label">XP Earned</div>
          </div>
          <div class="stat-item">
            <div class="number">${data.streak_days}</div>
            <div class="label">Active Days</div>
          </div>
          <div class="stat-item">
            <div class="number">${data.milestones_reached.length}</div>
            <div class="label">Milestones</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Activity by Category</div>
        ${buildCategoryBars(data)}
      </div>

      <div class="section">
        <div class="section-title">Milestones Reached</div>
        ${buildMilestonesList(data)}
      </div>

      <div class="section">
        <div class="section-title">Summary</div>
        <div class="narrative">${narrative}</div>
      </div>

      <div class="footer">
        Made with love using Little Learner Tracker
      </div>
    </body>
    </html>
  `;
}

export async function generateAndSharePdf(
  childName: string,
  reportType: string,
  periodStart: string,
  periodEnd: string,
  data: ReportData
): Promise<void> {
  const html = buildReportHtml(
    childName,
    reportType,
    periodStart,
    periodEnd,
    data
  );
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Report',
  });
}
