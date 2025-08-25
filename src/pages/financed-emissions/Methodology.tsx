import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { reportingAgent } from '@/services/reporting-agent';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AssumptionsBuilder } from '@/components/assumptions/AssumptionsBuilder';
const usePageSEO = (title: string, description: string, canonicalPath: string) => {
  useEffect(() => {
    document.title = title;
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    setMeta('description', description);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    const base = window.location.origin;
    link.setAttribute('href', base + canonicalPath);
  }, [title, description, canonicalPath]);
};

export default function MethodologyPage() {
  usePageSEO(
    'PCAF Data Quality & Methodology | PCAF FI Platform',
    'How we classify and defend PCAF data quality for vehicle loans (API, CSV, telematics, fuel cards).',
    '/financed-emissions/methodology'
  );

  const contentRef = useRef<HTMLDivElement>(null);

  const exportDocx = async () => {
    const sections = [
      {
        title: 'How we classify data quality',
        bullets: [
          'Option 1a: Measured fuel consumption + known make/model (e.g., fuel cards).',
          'Option 1b: Actual distance (telematics/odometer) + efficiency from make/model.',
          'Option 2a/2b: Make/model efficiency + local/regional statistical distance.',
          'Option 3a: Vehicle type + statistical distance; 3b: averages with conservative defaults.',
        ],
      },
      {
        title: 'Defending scoring when no real-time data',
        bullets: [
          'Provenance: store source type and timestamp for each metric (API vs CSV).',
          'Conservative assumptions: default to 15,000 km/year and documented emission factors.',
          'Cross-checks: reasonableness rules, outlier detection, and periodic borrower attestations.',
          'Improvement plan: path to Option 1 with telematics/fuel cards over time.',
        ],
      },
      {
        title: 'Regional adaptations (example: East Africa)',
        bullets: [
          'Local mileage statistics via transport surveys and city registries for 2a.',
          'Fuel blend factors and grid intensity for region-specific emission factors.',
          'Registry integrations (e.g., NTSA/KRA) to verify vehicle attributes where possible.',
        ],
      },
    ];

    await reportingAgent.exportDocx('PCAF Data Quality & Methodology', {
      narrative:
        'This document explains the PCAF-compliant data quality approach for motor vehicle loans, mapping data sources to PCAF options and defending scores when real-time data is unavailable.',
      sections,
      sources: [],
    });
  };

  const exportPDF = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = { width: pageWidth - 20, height: (canvas.height * (pageWidth - 20)) / canvas.width };
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgProps.width, imgProps.height, undefined, 'FAST');
    pdf.save('pcaf-data-quality-methodology.pdf');
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">PCAF Data Quality & Methodology for Vehicle Loans</h1>
        <p className="text-muted-foreground">How we classify, defend, and communicate data quality from APIs and CSV uploads.</p>
      </header>

      <div className="flex gap-2 mb-6">
        <Button onClick={exportDocx}>Export DOCX</Button>
        <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
      </div>

      <div ref={contentRef}>
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Classification Overview</CardTitle>
              <CardDescription>Mapping typical data sources to PCAF options and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Explanation</TableHead>
                    <TableHead>PCAF Option</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Fuel cards (measured liters)</TableCell>
                    <TableCell>Direct consumption measurements tied to vehicle/driver via receipts/API.</TableCell>
                    <TableCell><Badge>1a</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Telematics / OBD</TableCell>
                    <TableCell>Actual distance traveled from device logs; efficiency from make/model.</TableCell>
                    <TableCell><Badge>1b</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Odometer photos</TableCell>
                    <TableCell>Periodic borrower attestations with image EXIF and reasonableness checks.</TableCell>
                    <TableCell><Badge variant="secondary">1b</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>VIN/OEM specs + local stats</TableCell>
                    <TableCell>Specific efficiency from VIN; distance from local statistical datasets.</TableCell>
                    <TableCell><Badge variant="secondary">2a</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>VIN/OEM specs + regional stats</TableCell>
                    <TableCell>Specific efficiency from VIN; distance from regional averages.</TableCell>
                    <TableCell><Badge variant="secondary">2b</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CSV upload (type only)</TableCell>
                    <TableCell>Type/category efficiency and statistical distance with cited sources.</TableCell>
                    <TableCell><Badge variant="outline">3a</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Minimal data</TableCell>
                    <TableCell>Average assumptions and conservative defaults with an improvement plan.</TableCell>
                    <TableCell><Badge variant="outline">3b</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <AssumptionsBuilder />

          <Card>
            <CardHeader>
              <CardTitle>Defending Your Score Without Real-Time Data</CardTitle>
              <CardDescription>Transparent, auditable approach aligned to PCAF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>Provenance tracking: we tag each metric with its source (API, CSV, telematics, fuel card) and timestamp.</li>
                <li>Conservative defaults: when unknown, we use documented defaults (e.g., 15,000 km/year) and cite sources.</li>
                <li>Reasonableness tests: validation service flags outliers, inconsistent years, and impossible values.</li>
                <li>Sampling & attestations: borrowers provide periodic odometer photos; outliers require supporting documents.</li>
                <li>Improvement roadmap: contracts and onboarding encourage migration to telematics or fuel card integrations.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Adaptations</CardTitle>
              <CardDescription>Applying the standard in constrained-data markets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>We support localized statistical distance datasets (city-level surveys, registry telemetry) for 2a, and fall back to regional datasets for 2b. Emission factors reflect local fuel blends and grid intensity for EVs/hybrids.</p>
              <p>Where registry access exists, we verify vehicle attributes (make/model/year) to unlock Option 2 paths while building toward Option 1 through pilots with telematics and fuel card providers.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
