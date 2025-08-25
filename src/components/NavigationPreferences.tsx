import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Navigation, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Star, 
  RotateCcw,
  Minimize2,
  Maximize2,
  Users,
  BarChart3,
  MapPin,
  TrendingUp,
  Wallet,
  Shield,
  FileText,
  AlertTriangle,
  MessageSquare,
  Store
} from "lucide-react";
import { useNavigationStore } from "@/hooks/useNavigationStore";

const navigationItems = [
  { id: 'dashboard', name: 'Portfolio Dashboard', icon: BarChart3, category: 'analytics' },
  { id: 'projects', name: 'Project Explorer', icon: MapPin, category: 'operations' },
  { id: 'tranches-builder', name: 'Tranche Builder', icon: TrendingUp, category: 'finance' },
  { id: 'tranches', name: 'Tranche Monitoring', icon: Wallet, category: 'finance' },
  { id: 'compliance', name: 'Compliance Vault', icon: Shield, category: 'governance' },
  { id: 'reports', name: 'Reporting', icon: FileText, category: 'analytics' },
  { id: 'alerts', name: 'Alerts & Risk', icon: AlertTriangle, category: 'governance' },
  { id: 'users', name: 'User Access', icon: Users, category: 'governance' },
  { id: 'tasks', name: 'Task Center', icon: MessageSquare, category: 'operations' },
  { id: 'workflows', name: 'Workflow Center', icon: TrendingUp, category: 'operations' },
  { id: 'marketplace', name: 'Marketplace', icon: Store, category: 'integrations' }
];

const categories = {
  analytics: { name: 'Analytics & Reporting', color: 'bg-blue-500' },
  finance: { name: 'Finance & Disbursements', color: 'bg-green-500' },
  operations: { name: 'Operations & Projects', color: 'bg-orange-500' },
  governance: { name: 'Governance & Compliance', color: 'bg-purple-500' },
  integrations: { name: 'Integrations & Apps', color: 'bg-pink-500' }
};

const navigationProfiles = [
  { id: 'full', name: 'Full Access', description: 'All features visible' },
  { id: 'operations', name: 'Operations Focus', description: 'Project and workflow management' },
  { id: 'finance', name: 'Finance Focus', description: 'Disbursements and financial oversight' },
  { id: 'governance', name: 'Governance Focus', description: 'Compliance and risk management' },
  { id: 'analyst', name: 'Data Analyst', description: 'Reporting and analytics tools' }
];

export const NavigationPreferences: React.FC = () => {
  const {
    visibleItems,
    pinnedItems,
    collapsedGroups,
    compactMode,
    activeProfile,
    toggleVisibility,
    togglePin,
    toggleGroupCollapse,
    setCompactMode,
    setActiveProfile,
    resetToDefaults
  } = useNavigationStore();

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const getCategoryItems = (categoryId: string) => {
    return navigationItems.filter(item => item.category === categoryId);
  };

  const getVisibleItemsInCategory = (categoryId: string) => {
    return getCategoryItems(categoryId).filter(item => visibleItems.includes(item.id));
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetItemId) {
      // Handle reordering logic here
      console.log(`Moving ${draggedItem} to position of ${targetItemId}`);
    }
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Profile Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Navigation Profiles
          </CardTitle>
          <CardDescription>
            Choose a predefined navigation layout or customize your own
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navigationProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  activeProfile === profile.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setActiveProfile(profile.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{profile.name}</h4>
                    {activeProfile === profile.id && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access & Display Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Quick Access Toolbar
            </CardTitle>
            <CardDescription>
              Pin up to 5 frequently used features for quick access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pinned Items ({pinnedItems.length}/5)</Label>
              <div className="flex flex-wrap gap-2">
                {pinnedItems.map((itemId) => {
                  const item = navigationItems.find(nav => nav.id === itemId);
                  if (!item) return null;
                  const Icon = item.icon;
                  return (
                    <Badge 
                      key={itemId} 
                      variant="secondary" 
                      className="flex items-center gap-1 p-2"
                    >
                      <Icon className="h-3 w-3" />
                      {item.name}
                      <button
                        onClick={() => togglePin(itemId)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
              </div>
              {pinnedItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No items pinned. Use the star icon next to navigation items below to pin them.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {compactMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              Display Options
            </CardTitle>
            <CardDescription>
              Customize how the navigation sidebar appears
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Show icons only with tooltips
                </p>
              </div>
              <Switch 
                checked={compactMode} 
                onCheckedChange={setCompactMode}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Navigation Width</Label>
              <Select defaultValue="normal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow (200px)</SelectItem>
                  <SelectItem value="normal">Normal (256px)</SelectItem>
                  <SelectItem value="wide">Wide (300px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefaults}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Items by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Navigation Items
          </CardTitle>
          <CardDescription>
            Control which navigation items are visible and organize them by category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(categories).map(([categoryId, category]) => {
            const categoryItems = getCategoryItems(categoryId);
            const visibleCount = getVisibleItemsInCategory(categoryId).length;
            const isCollapsed = collapsedGroups.includes(categoryId);

            return (
              <div key={categoryId} className="space-y-3">
                <div 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleGroupCollapse(categoryId)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    <h4 className="font-medium">{category.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {visibleCount}/{categoryItems.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-2 ml-6">
                    {categoryItems.map((item) => {
                      const Icon = item.icon;
                      const isVisible = visibleItems.includes(item.id);
                      const isPinned = pinnedItems.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, item.id)}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <Icon className="h-4 w-4" />
                            <span className={isVisible ? 'text-foreground' : 'text-muted-foreground'}>
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePin(item.id)}
                              disabled={!isVisible || (pinnedItems.length >= 5 && !isPinned)}
                              className={isPinned ? 'text-yellow-500' : ''}
                            >
                              <Star className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
                            </Button>
                            <Switch 
                              checked={isVisible}
                              onCheckedChange={() => toggleVisibility(item.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button size="lg">
          Save Navigation Preferences
        </Button>
      </div>
    </div>
  );
};