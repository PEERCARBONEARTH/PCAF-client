import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, FileText, LineChart, ListChecks, PlayCircle, Sparkles } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { reportingAgent, type SuggestedContent } from "@/services/reporting-agent";

export interface PreviewReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  icon: any;
  estimatedTime: string;
  audience: string;
  preview: string;
  sections: string[];
  features: string[];
  complexity?: string;
  compliance?: string[];
}

export function ReportTemplatePreview({
  open,
  onOpenChange,
  template,
  onUseTemplate,
  onEditPresentation,
  autoSuggestOnOpen,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PreviewReportTemplate;
  onUseTemplate: () => void;
  onEditPresentation: () => void;
  autoSuggestOnOpen?: boolean;
}) {
  const Icon = template.icon ?? FileText;
  const navigate = useNavigate();

  const [assistLoading, setAssistLoading] = React.useState(false);
  const [assist, setAssist] = React.useState<SuggestedContent | null>(null);

  React.useEffect(() => {
    if (open && autoSuggestOnOpen && !assist && !assistLoading) {
      handleSuggest();
    }
  }, [open, autoSuggestOnOpen]);

  async function handleSuggest() {
    try {
      setAssistLoading(true);
      const suggestion = await reportingAgent.getAutoSuggestions(template.id);
      setAssist(suggestion);
    } finally {
      setAssistLoading(false);
    }
  }

  async function handleExportDocx() {
    if (!assist) return;
    await reportingAgent.exportDocx(template.name, assist);
  }

  async function handleExportPdf() {
    await reportingAgent.exportPdf();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex p-2 rounded-md bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </span>
            {template.name}
          </DialogTitle>
          <CardDescription className="pl-12 text-muted-foreground">
            {template.description}
          </CardDescription>
        </DialogHeader>

        <Separator />

        <main className="p-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="samples">Sample Slides</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="assist">AI Assist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Key features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {template.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-primary" /> Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Format</p>
                      <p className="font-medium">{template.format}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estimated time</p>
                      <p className="font-medium">{template.estimatedTime}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Audience</p>
                      <p className="font-medium">{template.audience}</p>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            <TabsContent value="outline" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Sections included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal ml-4 space-y-1 text-sm">
                    {template.sections.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="samples" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Executive Snapshot','Hotspots & Drivers','Benchmarking','Action Roadmap'].map((title) => (
                  <Card key={title} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-primary" /> {title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[16/9] rounded-md bg-muted grid place-items-center border">
                        <span className="text-xs text-muted-foreground">Slide preview mock</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-primary" /> Example KPIs
                  </CardTitle>
                  <CardDescription>Financed emissions intensity, sector contribution, data quality distribution, year-over-year change</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["Emissions Intensity","Sector Mix","DQ Scores","YoY Change"].map((k) => (
                      <Badge key={k} variant="outline">{k}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assist" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI-assisted draft</CardTitle>
                  <CardDescription>Scan client docs, platform knowledge, and portfolio analytics to draft content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={() => navigate('/financed-emissions/ai-insights')}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Open AI Insights
                    </Button>
                  </div>

                  {assist && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">Narrative</h4>
                        <p className="text-sm text-muted-foreground">{assist.narrative}</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Suggested sections</h4>
                        {assist.sections.map((sec) => (
                          <div key={sec.title} className="border rounded-md p-3">
                            <div className="text-sm font-medium mb-2">{sec.title}</div>
                            <ul className="list-disc ml-6 text-sm text-muted-foreground space-y-1">
                              {sec.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      {assist.sources?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium">Sources</h4>
                          <ul className="text-xs text-muted-foreground list-disc ml-6">
                            {assist.sources.map((s) => (
                              <li key={`${s.documentId}-${s.sectionId}`}>{s.title} – {s.excerpt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="p-6 pt-2 flex items-center justify-between bg-card/60 border-t">
          <div className="text-xs text-muted-foreground">PCAF-ready • Analytical • {template.format}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onUseTemplate}>Use this template</Button>
            <Button onClick={onEditPresentation}>Edit presentation</Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

export default ReportTemplatePreview;
