import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Download, FileText, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";

interface Slide {
  id: string;
  title: string;
  bullets: string[];
}

export default function PortfolioDeepAnalysisPresentation() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Portfolio Deep Analysis Presentation Editor";
    // Meta description
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Edit and export the Portfolio Deep Analysis presentation template with portfolio breakdowns, hotspots, benchmarks, and roadmap.");
    // Canonical
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, []);

  const [slides, setSlides] = useState<Slide[]>([
    { id: crypto.randomUUID(), title: "Executive snapshot", bullets: ["Total financed emissions: 1.2 MtCO2e", "Intensity down 8% YoY", "Top 3 sectors drive 72% of total"] },
    { id: crypto.randomUUID(), title: "Emission hotspots", bullets: ["Automotive manufacturing portfolio", "High DQ scores variance in SME loans", "3 counterparties with outsized contribution"] },
    { id: crypto.randomUUID(), title: "Benchmarking & peers", bullets: ["Intensity below sector median by 6%", "Scope mix comparable to peers", "Attribution aligned with PCAF 2.0"] },
    { id: crypto.randomUUID(), title: "Action roadmap", bullets: ["Tighten data quality on auto finance (D,Q)", "Engage top contributors for target-setting", "Rebalance pipeline toward low-carbon tech"] },
  ]);

  const [activeId, setActiveId] = useState(slides[0].id);

  const activeSlide = useMemo(() => slides.find(s => s.id === activeId)!, [slides, activeId]);

  const addSlide = () => {
    const s: Slide = { id: crypto.randomUUID(), title: "New slide", bullets: ["First talking point"] };
    setSlides((prev) => [...prev, s]);
    setActiveId(s.id);
  };

  const removeSlide = (id: string) => {
    setSlides((prev) => prev.filter(s => s.id !== id));
    setActiveId((prev) => {
      const remaining = slides.filter(s => s.id !== id);
      return remaining[0]?.id ?? "";
    });
  };

  const updateActive = (partial: Partial<Slide>) => {
    setSlides((prev) => prev.map(s => s.id === activeId ? { ...s, ...partial } : s));
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    slides.forEach((s, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFontSize(18);
      doc.text(s.title, 40, 60);
      doc.setFontSize(12);
      let y = 100;
      s.bullets.forEach((b) => {
        const lines = doc.splitTextToSize(`• ${b}`, 500);
        doc.text(lines, 60, y);
        y += lines.length * 16 + 6;
      });
      // footer
      doc.setFontSize(9);
      doc.text(`Portfolio Deep Analysis • ${idx + 1}/${slides.length}`, 40, 820);
    });
    doc.save("portfolio-deep-analysis.pdf");
    toast({ title: "Exported", description: "Presentation saved as PDF." });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Portfolio Deep Analysis Presentation</h1>
              <p className="text-muted-foreground">Edit slide content and export to PDF</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast({ title: "Saved", description: "Changes saved locally for this session." })}>Save</Button>
            <Button onClick={exportPdf} className="inline-flex items-center gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Slides</CardTitle>
              <CardDescription>Manage the outline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`w-full text-left p-3 rounded-md border transition ${activeId === s.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{i + 1}. {s.title}</span>
                    <Badge variant="outline">{s.bullets.length}</Badge>
                  </div>
                </button>
              ))}
              <Button variant="secondary" className="w-full inline-flex items-center gap-2" onClick={addSlide}>
                <Plus className="h-4 w-4" /> Add slide
              </Button>
            </CardContent>
          </Card>
        </aside>

        <section className="lg:col-span-9">
          <Card>
            <CardHeader>
              <CardTitle className="text-base inline-flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Slide editor
              </CardTitle>
              <CardDescription>Title and bullet points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <Input value={activeSlide.title} onChange={(e) => updateActive({ title: e.target.value })} />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Bullets</label>
                  <Button size="sm" variant="outline" onClick={() => updateActive({ bullets: [...activeSlide.bullets, "New point"] })}>Add bullet</Button>
                </div>

                {activeSlide.bullets.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Textarea
                      value={b}
                      onChange={(e) => {
                        const copy = [...activeSlide.bullets];
                        copy[idx] = e.target.value;
                        updateActive({ bullets: copy });
                      }}
                      className="min-h-[60px]"
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const copy = activeSlide.bullets.filter((_, i) => i !== idx);
                      updateActive({ bullets: copy });
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
