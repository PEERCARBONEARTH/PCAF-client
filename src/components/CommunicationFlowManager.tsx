import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  Mail,
  Bell,
  Phone,
  MessageSquare,
  Eye,
  Reply,
  Forward,
  Archive
} from "lucide-react";

interface CommunicationChannel {
  id: string;
  type: "email" | "sms" | "whatsapp" | "in-app" | "webhook";
  name: string;
  description: string;
  status: "active" | "inactive" | "error";
  configuration: Record<string, any>;
  lastUsed?: string;
  messagesSent: number;
  deliveryRate: number;
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "notification";
  subject?: string;
  content: string;
  variables: string[];
  tags: string[];
  lastModified: string;
  usageCount: number;
}

interface CommunicationCampaign {
  id: string;
  name: string;
  description: string;
  channels: string[];
  recipients: {
    type: "all" | "group" | "individual";
    targets: string[];
    count: number;
  };
  template: string;
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  scheduledAt?: string;
  sentAt?: string;
  deliveredCount: number;
  readCount: number;
  responseCount: number;
  autoFollowUp?: boolean;
}

interface CommunicationFlowProps {
  channels: CommunicationChannel[];
  templates: CommunicationTemplate[];
  campaigns: CommunicationCampaign[];
  onChannelTest: (channelId: string) => Promise<boolean>;
  onChannelToggle: (channelId: string) => void;
  onTemplateCreate: (template: Omit<CommunicationTemplate, 'id' | 'lastModified' | 'usageCount'>) => void;
  onCampaignCreate: (campaign: Omit<CommunicationCampaign, 'id' | 'deliveredCount' | 'readCount' | 'responseCount'>) => void;
  onCampaignSend: (campaignId: string) => Promise<void>;
  onCampaignSchedule: (campaignId: string, scheduledAt: string) => void;
}

export function CommunicationFlowManager({ channels, templates, campaigns, onChannelTest, onChannelToggle, onTemplateCreate, onCampaignCreate, onCampaignSend, onCampaignSchedule }: CommunicationFlowProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "email" as const,
    subject: "",
    content: "",
    variables: [] as string[],
    tags: [] as string[]
  });
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    channels: [] as string[],
    recipients: {
      type: "all" as const,
      targets: [] as string[],
      count: 0
    },
    template: "",
    status: "draft" as const,
    autoFollowUp: false
  });
  const [testingChannels, setTestingChannels] = useState<Set<string>>(new Set());
  const [sendingCampaigns, setSendingCampaigns] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleChannelTest = async (channelId: string) => {
    setTestingChannels(prev => new Set(prev).add(channelId));
    try {
      const success = await onChannelTest(channelId);
      toast({
        title: success ? "Test Successful" : "Test Failed",
        description: success ? 
          "Channel is working correctly and ready for campaigns." : 
          "Channel test failed. Please check configuration.",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Unable to test channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTestingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }
  };

  const handleCampaignSend = async (campaignId: string) => {
    setSendingCampaigns(prev => new Set(prev).add(campaignId));
    try {
      await onCampaignSend(campaignId);
      toast({
        title: "Campaign Started",
        description: "Communication campaign is now sending. Track progress in real-time.",
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Unable to start campaign. Please check configuration.",
        variant: "destructive",
      });
    } finally {
      setSendingCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
    }
  };

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) return;
    
    onTemplateCreate({
      ...newTemplate,
      variables: newTemplate.content.match(/\{\{(\w+)\}\}/g)?.map(v => v.slice(2, -2)) || []
    });
    
    setNewTemplate({
      name: "",
      type: "email",
      subject: "",
      content: "",
      variables: [],
      tags: []
    });
    setShowTemplateDialog(false);
    
    toast({
      title: "Template Created",
      description: "Communication template is ready for use in campaigns.",
    });
  };

  const createCampaign = () => {
    if (!newCampaign.name || !newCampaign.template || newCampaign.channels.length === 0) return;
    
    onCampaignCreate({
      ...newCampaign,
      recipients: {
        ...newCampaign.recipients,
        count: newCampaign.recipients.type === "all" ? 1500 : newCampaign.recipients.targets.length
      }
    });
    
    setNewCampaign({
      name: "",
      description: "",
      channels: [],
      recipients: { type: "all", targets: [], count: 0 },
      template: "",
      status: "draft",
      autoFollowUp: false
    });
    setShowCampaignDialog(false);
    
    toast({
      title: "Campaign Created",
      description: "Communication campaign created and ready to send or schedule.",
    });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "sms": return <Phone className="h-4 w-4" />;
      case "whatsapp": return <MessageCircle className="h-4 w-4" />;
      case "in-app": return <Bell className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "sending": return "text-warning";
      case "failed": return "text-destructive";
      case "scheduled": return "text-info";
      default: return "text-muted-foreground";
    }
  };

  const activeChannels = channels.filter(c => c.status === "active");
  const activeCampaigns = campaigns.filter(c => c.status === "sending" || c.status === "scheduled");
  const completedCampaigns = campaigns.filter(c => c.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Communication Flow Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage multi-channel communications with automated follow-ups
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button onClick={() => setShowCampaignDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Communication Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Communication Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <div key={channel.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getChannelIcon(channel.type)}
                    <div>
                      <h4 className="font-medium text-foreground">{channel.name}</h4>
                      <p className="text-xs text-muted-foreground">{channel.type}</p>
                    </div>
                  </div>
                  <Badge variant={channel.status === "active" ? "default" : channel.status === "error" ? "destructive" : "secondary"}>
                    {channel.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Messages sent:</span>
                    <span className="font-medium">{channel.messagesSent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery rate:</span>
                    <span className="font-medium">{channel.deliveryRate}%</span>
                  </div>
                  {channel.lastUsed && (
                    <div className="flex justify-between">
                      <span>Last used:</span>
                      <span className="font-medium">{new Date(channel.lastUsed).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleChannelTest(channel.id)}
                    disabled={testingChannels.has(channel.id)}
                  >
                    {testingChannels.has(channel.id) ? "Testing..." : "Test Channel"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onChannelToggle(channel.id)}
                  >
                    {channel.status === "active" ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-warning" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{campaign.name}</h4>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  </div>
                  <Badge className={getCampaignStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Recipients</p>
                    <p className="font-medium">{campaign.recipients.count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivered</p>
                    <p className="font-medium">{campaign.deliveredCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Responses</p>
                    <p className="font-medium">{campaign.responseCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {campaign.status === "draft" && (
                    <Button 
                      size="sm"
                      onClick={() => handleCampaignSend(campaign.id)}
                      disabled={sendingCampaigns.has(campaign.id)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send Now
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Message Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{template.name}</h4>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                {template.subject && (
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Subject: {template.subject}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.content}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Used {template.usageCount} times</span>
                  <span>Modified {new Date(template.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Message Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="notification">In-App Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newTemplate.type === "email" && (
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject..."
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter message content... Use {{variable}} for dynamic content."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={createTemplate}>Create Template</Button>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Communication Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter campaign name..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCampaign.description}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the campaign purpose..."
              />
            </div>

            <div className="space-y-2">
              <Label>Message Template</Label>
              <Select value={newCampaign.template} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, template: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={createCampaign}>Create Campaign</Button>
              <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}