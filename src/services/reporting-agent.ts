import { platformRAGService, type DocumentReference } from '@/services/platform-rag-service';
import { PCAFReportGenerator } from '@/lib/reportGenerator';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

export interface SuggestedSection {
  title: string;
  bullets: string[];
}

export interface SuggestedContent {
  narrative: string;
  sections: SuggestedSection[];
  sources: DocumentReference[];
}

function splitIntoBullets(text: string): string[] {
  if (!text) return [];
  // Split by sentences and clean
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 6); // keep it concise
}

export class ReportingAgentService {
  // Aggregate from portfolio analytics and platform RAG into draft content
  async getAutoSuggestions(templateId: string): Promise<SuggestedContent> {
    // Pull portfolio metrics (Dexie-backed demo data)
    const data = await PCAFReportGenerator.generateReportData();

    // Ask the platform reporting agent for a narrative suited for deep analysis
    const narrativePack = await platformRAGService.generateReportNarrative('detailed-analysis', data);

    const sections: SuggestedSection[] = narrativePack.sections.map((s) => ({
      title: s.title,
      bullets: splitIntoBullets(s.content),
    }));

    // Add quick metrics bullets from portfolio analytics
    const overviewBullets: string[] = [
      `Total loans: ${data.portfolioSummary.totalLoans}`,
      `Outstanding balance: $${Math.round(data.portfolioSummary.totalOutstandingBalance).toLocaleString()}`,
      `Total financed emissions: ${data.portfolioSummary.totalFinancedEmissions.toFixed(3)} tCO2e`,
      `Emission intensity: ${data.portfolioSummary.emissionIntensity.toFixed(4)} kg CO2e per $`,
      `Weighted data quality score: ${data.portfolioSummary.weightedAvgDataQuality.toFixed(2)}`,
    ];

    sections.unshift({ title: 'Executive Snapshot', bullets: overviewBullets });

    return {
      narrative: narrativePack.narrative,
      sections,
      sources: narrativePack.sources,
    };
  }

  // Export a simple, editable Word document from suggestions
  async exportDocx(fileName: string, suggested: SuggestedContent): Promise<void> {
    const children: Paragraph[] = [];

    // Title
    children.push(new Paragraph({
      text: fileName,
      heading: HeadingLevel.TITLE,
    }));

    // Narrative
    children.push(new Paragraph({
      text: 'Narrative',
      heading: HeadingLevel.HEADING_1,
    }));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: suggested.narrative })],
      })
    );

    // Sections
    for (const section of suggested.sections) {
      children.push(
        new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 })
      );
      for (const bullet of section.bullets) {
        children.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
          })
        );
      }
    }

    // Sources
    if (suggested.sources?.length) {
      children.push(
        new Paragraph({ text: 'Sources', heading: HeadingLevel.HEADING_2 })
      );
      for (const src of suggested.sources) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${src.title} (relevance ${(src.relevanceScore * 100).toFixed(0)}%)` }),
              new TextRun({ text: ` — ${src.excerpt}`, break: 1 }),
            ],
          })
        );
      }
    }

    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, '_').toLowerCase()}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Export portfolio summary PDF via existing generator (demo scope)
  async exportPdf(): Promise<void> {
    const data = await PCAFReportGenerator.generateReportData();
    await PCAFReportGenerator.generatePortfolioSummaryPDF(data);
  }
}

export const reportingAgent = new ReportingAgentService();
