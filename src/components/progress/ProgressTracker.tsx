import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Award,
  Zap,
  Brain,
  Shield,
  BarChart3,
  Flame,
  Calendar,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'data-quality' | 'compliance' | 'efficiency' | 'mastery' | 'collaboration';
  points: number;
  unlockedAt?: Date;
  progress: number; // 0-100
  requirements: AchievementRequirement[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  hidden?: boolean; // Hidden until unlocked
}

export interface AchievementRequirement {
  type: 'upload_count' | 'wdqs_score' | 'fast_calculations' | 'report_generation' | 'data_coverage' | 'consecutive_days';
  operator?: '<=' | '>=' | '=' | '>';
  value: number;
  description: string;
}

export interface UserProgress {
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  achievements: Achievement[];
  streaks: {
    dailyLogin: number;
    dataUploads: number;
    complianceChecks: number;
    reportGeneration: number;
  };
  skillLevels: {
    pcafExpert: number; // 1-5
    dataQuality: number;
    reporting: number;
    analysis: number;
    efficiency: number;
  };
  stats: {
    totalCalculations: number;
    totalReports: number;
    totalDataUploads: number;
    averageCalculationTime: number; // seconds
    bestWDQSScore: number;
    daysActive: number;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'achievement' | 'level_up' | 'calculation' | 'report' | 'upload';
  title: string;
  description: string;
  timestamp: Date;
  points?: number;
  icon: string;
}

// Predefined achievements
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-upload',
    title: 'Data Pioneer',
    description: 'Upload your first loan portfolio',
    icon: '🚀',
    category: 'data-quality',
    points: 100,
    progress: 0,
    rarity: 'common',
    requirements: [
      { type: 'upload_count', operator: '>=', value: 1, description: 'Upload 1 portfolio' }
    ]
  },
  {
    id: 'pcaf-compliant',
    title: 'PCAF Master',
    description: 'Achieve PCAF compliance (WDQS ≤ 3.0)',
    icon: '🏆',
    category: 'compliance',
    points: 500,
    progress: 0,
    rarity: 'epic',
    requirements: [
      { type: 'wdqs_score', operator: '<=', value: 3.0, description: 'Achieve WDQS ≤ 3.0' }
    ]
  },
  {
    id: 'efficiency-expert',
    title: 'Speed Demon',
    description: 'Complete 10 calculations in under 5 minutes each',
    icon: '⚡',
    category: 'efficiency',
    points: 300,
    progress: 0,
    rarity: 'rare',
    requirements: [
      { type: 'fast_calculations', operator: '>=', value: 10, description: 'Complete 10 fast calculations' }
    ]
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Achieve perfect WDQS score of 1.0',
    icon: '💎',
    category: 'mastery',
    points: 1000,
    progress: 0,
    rarity: 'legendary',
    requirements: [
      { type: 'wdqs_score', operator: '<=', value: 1.0, description: 'Achieve perfect WDQS score' }
    ]
  },
  {
    id: 'data-completionist',
    title: 'Data Completionist',
    description: 'Achieve 100% data coverage across portfolio',
    icon: '📊',
    category: 'data-quality',
    points: 400,
    progress: 0,
    rarity: 'rare',
    requirements: [
      { type: 'data_coverage', operator: '>=', value: 100, description: 'Achieve 100% data coverage' }
    ]
  },
  {
    id: 'report-master',
    title: 'Report Master',
    description: 'Generate 25 professional reports',
    icon: '📋',
    category: 'mastery',
    points: 600,
    progress: 0,
    rarity: 'epic',
    requirements: [
      { type: 'report_generation', operator: '>=', value: 25, description: 'Generate 25 reports' }
    ]
  },
  {
    id: 'consistency-champion',
    title: 'Consistency Champion',
    description: 'Login for 30 consecutive days',
    icon: '🔥',
    category: 'collaboration',
    points: 750,
    progress: 0,
    rarity: 'epic',
    requirements: [
      { type: 'consecutive_days', operator: '>=', value: 30, description: 'Login 30 consecutive days' }
    ]
  }
];

interface ProgressTrackerProps {
  portfolioMetrics?: any;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

export function ProgressTracker({ portfolioMetrics, onAchievementUnlock }: ProgressTrackerProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  useEffect(() => {
    loadUserProgress();
  }, [portfolioMetrics]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      
      // Load from localStorage or generate initial progress
      const savedProgress = localStorage.getItem('pcaf-user-progress');
      let progress: UserProgress;
      
      if (savedProgress) {
        progress = JSON.parse(savedProgress);
        // Update achievements based on current metrics
        progress = await updateAchievements(progress, portfolioMetrics);
      } else {
        progress = generateInitialProgress();
      }
      
      setUserProgress(progress);
      
      // Check for new achievements
      const newAchievements = progress.achievements.filter(
        a => a.unlockedAt && Date.now() - a.unlockedAt.getTime() < 5000 // Last 5 seconds
      );
      
      if (newAchievements.length > 0) {
        setRecentAchievements(newAchievements);
        newAchievements.forEach(achievement => {
          onAchievementUnlock?.(achievement);
          showAchievementNotification(achievement);
        });
      }
      
    } catch (error) {
      console.error('Failed to load user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInitialProgress = (): UserProgress => {
    return {
      level: 1,
      totalPoints: 0,
      pointsToNextLevel: 1000,
      achievements: ACHIEVEMENTS.map(a => ({ ...a, progress: 0 })),
      streaks: {
        dailyLogin: 1,
        dataUploads: 0,
        complianceChecks: 0,
        reportGeneration: 0
      },
      skillLevels: {
        pcafExpert: 1,
        dataQuality: 1,
        reporting: 1,
        analysis: 1,
        efficiency: 1
      },
      stats: {
        totalCalculations: 0,
        totalReports: 0,
        totalDataUploads: 0,
        averageCalculationTime: 0,
        bestWDQSScore: 5.0,
        daysActive: 1
      },
      recentActivity: [
        {
          id: 'welcome',
          type: 'achievement',
          title: 'Welcome to PCAF!',
          description: 'Started your emissions tracking journey',
          timestamp: new Date(),
          points: 50,
          icon: '👋'
        }
      ]
    };
  };

  const updateAchievements = async (progress: UserProgress, metrics: any): Promise<UserProgress> => {
    if (!metrics) return progress;

    const updatedAchievements = [...progress.achievements];
    let newPoints = 0;
    const newActivity: ActivityItem[] = [];

    // Update achievement progress based on metrics
    updatedAchievements.forEach(achievement => {
      if (achievement.unlockedAt) return; // Already unlocked

      let currentProgress = 0;
      let isUnlocked = false;

      achievement.requirements.forEach(req => {
        switch (req.type) {
          case 'upload_count':
            currentProgress = Math.min(100, (progress.stats.totalDataUploads / req.value) * 100);
            isUnlocked = progress.stats.totalDataUploads >= req.value;
            break;
          case 'wdqs_score':
            if (metrics.weightedAvgDataQuality) {
              const score = metrics.weightedAvgDataQuality;
              if (req.operator === '<=') {
                currentProgress = score <= req.value ? 100 : Math.max(0, (5 - score) / (5 - req.value) * 100);
                isUnlocked = score <= req.value;
              }
            }
            break;
          case 'data_coverage':
            // Mock data coverage calculation
            const coverage = calculateDataCoverage(metrics);
            currentProgress = Math.min(100, (coverage / req.value) * 100);
            isUnlocked = coverage >= req.value;
            break;
          case 'report_generation':
            currentProgress = Math.min(100, (progress.stats.totalReports / req.value) * 100);
            isUnlocked = progress.stats.totalReports >= req.value;
            break;
          case 'consecutive_days':
            currentProgress = Math.min(100, (progress.streaks.dailyLogin / req.value) * 100);
            isUnlocked = progress.streaks.dailyLogin >= req.value;
            break;
        }
      });

      achievement.progress = currentProgress;

      if (isUnlocked && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date();
        newPoints += achievement.points;
        
        newActivity.push({
          id: `achievement-${achievement.id}`,
          type: 'achievement',
          title: `Achievement Unlocked: ${achievement.title}`,
          description: achievement.description,
          timestamp: new Date(),
          points: achievement.points,
          icon: achievement.icon
        });
      }
    });

    // Update level based on total points
    const totalPoints = progress.totalPoints + newPoints;
    const newLevel = Math.floor(totalPoints / 1000) + 1;
    const pointsToNextLevel = (newLevel * 1000) - totalPoints;

    if (newLevel > progress.level) {
      newActivity.push({
        id: `level-up-${newLevel}`,
        type: 'level_up',
        title: `Level Up! You're now Level ${newLevel}`,
        description: `Congratulations on reaching Level ${newLevel}!`,
        timestamp: new Date(),
        points: 100, // Bonus points for leveling up
        icon: '🎉'
      });
    }

    // Update skill levels based on achievements
    const skillLevels = { ...progress.skillLevels };
    const unlockedAchievements = updatedAchievements.filter(a => a.unlockedAt);
    
    skillLevels.pcafExpert = Math.min(5, Math.floor(unlockedAchievements.filter(a => a.category === 'compliance').length / 2) + 1);
    skillLevels.dataQuality = Math.min(5, Math.floor(unlockedAchievements.filter(a => a.category === 'data-quality').length / 2) + 1);
    skillLevels.efficiency = Math.min(5, Math.floor(unlockedAchievements.filter(a => a.category === 'efficiency').length / 2) + 1);

    const updatedProgress: UserProgress = {
      ...progress,
      level: newLevel,
      totalPoints: totalPoints,
      pointsToNextLevel,
      achievements: updatedAchievements,
      skillLevels,
      recentActivity: [...newActivity, ...progress.recentActivity].slice(0, 10), // Keep last 10 activities
      stats: {
        ...progress.stats,
        bestWDQSScore: metrics.weightedAvgDataQuality ? 
          Math.min(progress.stats.bestWDQSScore, metrics.weightedAvgDataQuality) : 
          progress.stats.bestWDQSScore
      }
    };

    // Save to localStorage
    localStorage.setItem('pcaf-user-progress', JSON.stringify(updatedProgress));

    return updatedProgress;
  };

  const calculateDataCoverage = (metrics: any) => {
    // Mock calculation - in real app, analyze actual data completeness
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  };

  const showAchievementNotification = (achievement: Achievement) => {
    toast({
      title: `🎉 Achievement Unlocked!`,
      description: `${achievement.title} - ${achievement.points} points earned`,
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data-quality': return <BarChart3 className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'mastery': return <Trophy className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading progress...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProgress) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Progress Tracking Unavailable</h3>
            <p className="text-muted-foreground">Unable to load progress data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Achievement Notifications */}
      {recentAchievements.length > 0 && (
        <AchievementNotification 
          achievements={recentAchievements} 
          onDismiss={() => setRecentAchievements([])}
        />
      )}

      {/* Level & Points Display */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                PCAF Expert Level {userProgress.level}
              </h3>
              <p className="text-muted-foreground">
                {userProgress.totalPoints.toLocaleString()} points earned
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl mb-1">🎯</div>
              <p className="text-sm text-muted-foreground">
                {userProgress.pointsToNextLevel} to Level {userProgress.level + 1}
              </p>
            </div>
          </div>
          
          <Progress 
            value={(userProgress.totalPoints % 1000) / 10} 
            className="h-3 mb-4" 
          />
          
          {/* Streaks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-bold">{userProgress.streaks.dailyLogin}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="font-bold">{userProgress.stats.totalCalculations}</span>
              </div>
              <p className="text-xs text-muted-foreground">Calculations</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-bold">{userProgress.stats.bestWDQSScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Best WDQS</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="font-bold">{userProgress.stats.daysActive}</span>
              </div>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userProgress.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    {activity.points && (
                      <Badge variant="outline">+{activity.points} pts</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {/* Achievement Categories */}
          <div className="grid gap-4">
            {Object.entries(
              userProgress.achievements.reduce((acc, achievement) => {
                if (!acc[achievement.category]) acc[achievement.category] = [];
                acc[achievement.category].push(achievement);
                return acc;
              }, {} as Record<string, Achievement[]>)
            ).map(([category, achievements]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {getCategoryIcon(category)}
                    {category.replace('-', ' ')} Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {achievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <SkillProgressGrid skills={userProgress.skillLevels} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isUnlocked 
        ? 'bg-background border-border hover:shadow-md' 
        : 'bg-muted/30 border-muted'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="text-2xl opacity-80">{achievement.icon}</div>
        <Badge className={getRarityColor(achievement.rarity)}>
          {achievement.rarity}
        </Badge>
      </div>
      
      <h4 className={`font-medium text-sm mb-1 ${!isUnlocked ? 'text-muted-foreground' : ''}`}>
        {achievement.title}
      </h4>
      <p className={`text-xs mb-3 ${!isUnlocked ? 'text-muted-foreground' : ''}`}>
        {achievement.description}
      </p>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>Progress</span>
          <span>{Math.round(achievement.progress)}%</span>
        </div>
        <Progress value={achievement.progress} className="h-1" />
        
        {isUnlocked && (
          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Unlocked
            </Badge>
            <span className="text-primary font-medium">+{achievement.points} pts</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface SkillProgressGridProps {
  skills: UserProgress['skillLevels'];
}

function SkillProgressGrid({ skills }: SkillProgressGridProps) {
  const skillInfo = {
    pcafExpert: { name: 'PCAF Expert', icon: <Shield className="h-5 w-5" />, color: 'text-blue-600' },
    dataQuality: { name: 'Data Quality', icon: <BarChart3 className="h-5 w-5" />, color: 'text-green-600' },
    reporting: { name: 'Reporting', icon: <Target className="h-5 w-5" />, color: 'text-purple-600' },
    analysis: { name: 'Analysis', icon: <Brain className="h-5 w-5" />, color: 'text-orange-600' },
    efficiency: { name: 'Efficiency', icon: <Zap className="h-5 w-5" />, color: 'text-yellow-600' }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(skills).map(([skillKey, level]) => {
        const skill = skillInfo[skillKey as keyof typeof skillInfo];
        const progress = (level / 5) * 100;
        
        return (
          <Card key={skillKey}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-muted ${skill.color}`}>
                  {skill.icon}
                </div>
                <div>
                  <h4 className="font-medium">{skill.name}</h4>
                  <p className="text-sm text-muted-foreground">Level {level}</p>
                </div>
              </div>
              
              <Progress value={progress} className="h-2 mb-2" />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
              
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= level 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

function AchievementNotification({ achievements, onDismiss }: AchievementNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Alert className="border-primary bg-primary/5 animate-in slide-in-from-top-2">
      <Trophy className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>Achievement{achievements.length > 1 ? 's' : ''} Unlocked!</strong>
            <div className="mt-1">
              {achievements.map((achievement, index) => (
                <div key={achievement.id} className="flex items-center gap-2">
                  <span>{achievement.icon}</span>
                  <span className="font-medium">{achievement.title}</span>
                  <Badge variant="outline">+{achievement.points} pts</Badge>
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            ×
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Helper function
function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default ProgressTracker;