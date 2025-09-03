import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Building2,
    Target,
    AlertTriangle,
    Plus,
    X,
    Save,
    CheckCircle
} from 'lucide-react';
import { BankProfile } from '@/services/dynamic-insights-engine';
import { bankProfileService } from '@/services/bank-profile-service';

interface BankProfileSetupProps {
    onComplete?: (profile: BankProfile) => void;
    onCancel?: () => void;
}

export function BankProfileSetup({ onComplete, onCancel }: BankProfileSetupProps) {
    const [profile, setProfile] = useState<Partial<BankProfile>>(() => {
        const existing = bankProfileService.getCurrentProfile();
        return existing || {
            name: '',
            type: 'community',
            assets: 0,
            portfolioSize: 0,
            primaryMarkets: [],
            experienceLevel: 'intermediate',
            businessGoals: [],
            currentChallenges: [],
            climateTargets: {
                evPortfolioTarget: 25,
                dataQualityTarget: 3.0,
                emissionReductionTarget: 50
            },
            preferredTone: 'conversational',
            reportingRequirements: []
        };
    });

    const [newMarket, setNewMarket] = useState('');
    const [newGoal, setNewGoal] = useState({ type: 'sustainability', priority: 'medium', target: '' });
    const [newChallenge, setNewChallenge] = useState({ type: 'data_quality', severity: 'medium', description: '' });

    const completionPercentage = React.useMemo(() => {
        let completed = 0;
        const total = 8;

        if (profile.name) completed++;
        if (profile.type) completed++;
        if (profile.assets && profile.assets > 0) completed++;
        if (profile.primaryMarkets && profile.primaryMarkets.length > 0) completed++;
        if (profile.businessGoals && profile.businessGoals.length > 0) completed++;
        if (profile.currentChallenges && profile.currentChallenges.length > 0) completed++;
        if (profile.climateTargets) completed++;
        if (profile.reportingRequirements && profile.reportingRequirements.length > 0) completed++;

        return Math.round((completed / total) * 100);
    }, [profile]);

    const handleSave = () => {
        if (profile.name && profile.type) {
            const completeProfile = bankProfileService.updateProfile(profile as BankProfile);
            onComplete?.(completeProfile);
        }
    };

    const addMarket = () => {
        if (newMarket.trim()) {
            setProfile(prev => ({
                ...prev,
                primaryMarkets: [...(prev.primaryMarkets || []), newMarket.trim()]
            }));
            setNewMarket('');
        }
    };

    const removeMarket = (index: number) => {
        setProfile(prev => ({
            ...prev,
            primaryMarkets: prev.primaryMarkets?.filter((_, i) => i !== index) || []
        }));
    };

    const addGoal = () => {
        if (newGoal.target.trim()) {
            setProfile(prev => ({
                ...prev,
                businessGoals: [...(prev.businessGoals || []), {
                    type: newGoal.type as 'sustainability' | 'growth' | 'compliance' | 'efficiency' | 'risk_management',
                    priority: newGoal.priority as 'high' | 'medium' | 'low',
                    target: newGoal.target
                }]
            }));
            setNewGoal({ type: 'sustainability', priority: 'medium', target: '' });
        }
    };

    const removeGoal = (index: number) => {
        setProfile(prev => ({
            ...prev,
            businessGoals: prev.businessGoals?.filter((_, i) => i !== index) || []
        }));
    };

    const addChallenge = () => {
        if (newChallenge.description.trim()) {
            setProfile(prev => ({
                ...prev,
                currentChallenges: [...(prev.currentChallenges || []), {
                    ...newChallenge,
                    type: newChallenge.type as 'data_quality' | 'regulatory_compliance' | 'market_competition' | 'technology' | 'staffing',
                    severity: newChallenge.severity as 'high' | 'medium' | 'low'
                }]
            }));
            setNewChallenge({ type: 'data_quality', severity: 'medium', description: '' });
        }
    };

    const removeChallenge = (index: number) => {
        setProfile(prev => ({
            ...prev,
            currentChallenges: prev.currentChallenges?.filter((_, i) => i !== index) || []
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Bank Profile Setup
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure your bank's profile to get personalized AI insights
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                    </div>
                    <Progress value={completionPercentage} className="mt-4" />
                </CardHeader>
            </Card>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input
                                id="bankName"
                                value={profile.name || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Community Bank"
                            />
                        </div>
                        <div>
                            <Label htmlFor="bankType">Bank Type</Label>
                            <select
                                id="bankType"
                                value={profile.type || 'community'}
                                onChange={(e) => setProfile(prev => ({ ...prev, type: e.target.value as any }))}
                                className="w-full p-2 border border-border rounded-md bg-background"
                            >
                                <option value="community">Community Bank</option>
                                <option value="regional">Regional Bank</option>
                                <option value="national">National Bank</option>
                                <option value="credit_union">Credit Union</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="assets">Total Assets ($ Millions)</Label>
                            <Input
                                id="assets"
                                type="number"
                                value={profile.assets || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, assets: Number(e.target.value) }))}
                                placeholder="850"
                            />
                        </div>
                        <div>
                            <Label htmlFor="portfolioSize">Portfolio Size (# of Loans)</Label>
                            <Input
                                id="portfolioSize"
                                type="number"
                                value={profile.portfolioSize || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, portfolioSize: Number(e.target.value) }))}
                                placeholder="247"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="experienceLevel">PCAF Experience Level</Label>
                        <select
                            id="experienceLevel"
                            value={profile.experienceLevel || 'intermediate'}
                            onChange={(e) => setProfile(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                            className="w-full p-2 border border-border rounded-md bg-background"
                        >
                            <option value="beginner">Beginner - New to PCAF</option>
                            <option value="intermediate">Intermediate - Some PCAF experience</option>
                            <option value="advanced">Advanced - PCAF expert</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Primary Markets */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Primary Markets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={newMarket}
                            onChange={(e) => setNewMarket(e.target.value)}
                            placeholder="e.g., Regional Metro Area"
                            onKeyDown={(e) => e.key === 'Enter' && addMarket()}
                        />
                        <Button onClick={addMarket} size="sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.primaryMarkets?.map((market, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {market}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => removeMarket(index)}
                                />
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Business Goals */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Business Goals
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select
                            value={newGoal.type}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value }))}
                            className="p-2 border border-border rounded-md bg-background"
                        >
                            <option value="sustainability">Sustainability</option>
                            <option value="growth">Growth</option>
                            <option value="compliance">Compliance</option>
                            <option value="efficiency">Efficiency</option>
                            <option value="risk_management">Risk Management</option>
                        </select>
                        <select
                            value={newGoal.priority}
                            onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value }))}
                            className="p-2 border border-border rounded-md bg-background"
                        >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>
                        <div className="flex gap-2">
                            <Input
                                value={newGoal.target}
                                onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                                placeholder="Target description"
                                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                            />
                            <Button onClick={addGoal} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {profile.businessGoals?.map((goal, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">{goal.type.replace('_', ' ')}</Badge>
                                        <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'secondary' : 'outline'}>
                                            {goal.priority} priority
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{goal.target}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeGoal(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Current Challenges */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Current Challenges
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select
                            value={newChallenge.type}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, type: e.target.value }))}
                            className="p-2 border border-border rounded-md bg-background"
                        >
                            <option value="data_quality">Data Quality</option>
                            <option value="regulatory_compliance">Regulatory Compliance</option>
                            <option value="market_competition">Market Competition</option>
                            <option value="technology">Technology</option>
                            <option value="staffing">Staffing</option>
                        </select>
                        <select
                            value={newChallenge.severity}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, severity: e.target.value }))}
                            className="p-2 border border-border rounded-md bg-background"
                        >
                            <option value="high">High Severity</option>
                            <option value="medium">Medium Severity</option>
                            <option value="low">Low Severity</option>
                        </select>
                        <div className="flex gap-2">
                            <Input
                                value={newChallenge.description}
                                onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Challenge description"
                                onKeyDown={(e) => e.key === 'Enter' && addChallenge()}
                            />
                            <Button onClick={addChallenge} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {profile.currentChallenges?.map((challenge, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">{challenge.type.replace('_', ' ')}</Badge>
                                        <Badge variant={challenge.severity === 'high' ? 'destructive' : challenge.severity === 'medium' ? 'secondary' : 'outline'}>
                                            {challenge.severity} severity
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeChallenge(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Climate Targets */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Climate Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="evTarget">EV Portfolio Target (%)</Label>
                            <Input
                                id="evTarget"
                                type="number"
                                value={profile.climateTargets?.evPortfolioTarget || ''}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev,
                                    climateTargets: {
                                        ...prev.climateTargets,
                                        evPortfolioTarget: Number(e.target.value)
                                    }
                                }))}
                                placeholder="25"
                            />
                        </div>
                        <div>
                            <Label htmlFor="dataQualityTarget">PCAF Score Target</Label>
                            <Input
                                id="dataQualityTarget"
                                type="number"
                                step="0.1"
                                value={profile.climateTargets?.dataQualityTarget || ''}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev,
                                    climateTargets: {
                                        ...prev.climateTargets,
                                        dataQualityTarget: Number(e.target.value)
                                    }
                                }))}
                                placeholder="3.0"
                            />
                        </div>
                        <div>
                            <Label htmlFor="emissionReduction">Emission Reduction Target (%)</Label>
                            <Input
                                id="emissionReduction"
                                type="number"
                                value={profile.climateTargets?.emissionReductionTarget || ''}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev,
                                    climateTargets: {
                                        ...prev.climateTargets,
                                        emissionReductionTarget: Number(e.target.value)
                                    }
                                }))}
                                placeholder="50"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    Profile {completionPercentage}% complete
                </div>
                <div className="flex items-center gap-3">
                    {onCancel && (
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={!profile.name || !profile.type}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Save Profile
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default BankProfileSetup;