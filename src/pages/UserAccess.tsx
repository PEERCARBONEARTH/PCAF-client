
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Key, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";

const userStats = [
  { label: "Active Users", value: "127", change: "+8%", icon: Users },
  { label: "Pending Invites", value: "12", change: "-20%", icon: Clock },
  { label: "Admin Users", value: "8", change: "0%", icon: Crown },
  { label: "Roles Defined", value: "15", change: "+2", icon: Shield }
];

const recentUsers = [
  {
    id: "USR-001",
    name: "Sarah Chen",
    email: "sarah.chen@peercarbon.io",
    role: "Project Manager",
    department: "Operations",
    status: "active",
    lastLogin: "2024-01-15 14:30",
    avatar: "SC",
    location: "Nairobi, Kenya",
    projects: 5
  },
  {
    id: "USR-002",
    name: "Michael Torres",
    email: "m.torres@example.com",
    role: "Financial Analyst", 
    department: "Finance",
    status: "active",
    lastLogin: "2024-01-15 09:15",
    avatar: "MT",
    location: "Remote",
    projects: 12
  },
  {
    id: "USR-003",
    name: "David Kim",
    email: "david.kim@verifier.org",
    role: "Carbon Verifier",
    department: "Compliance",
    status: "pending",
    lastLogin: "Never",
    avatar: "DK",
    location: "Seoul, South Korea",
    projects: 0
  },
  {
    id: "USR-004",
    name: "Amara Okafor",
    email: "a.okafor@dfi.com",
    role: "Investment Officer",
    department: "Investment",
    status: "active",
    lastLogin: "2024-01-14 16:45",
    avatar: "AO",
    location: "Lagos, Nigeria",
    projects: 8
  }
];

const rolePermissions = [
  {
    role: "Super Admin",
    users: 2,
    permissions: ["Full System Access", "User Management", "Financial Operations", "System Settings"],
    color: "text-red-600"
  },
  {
    role: "Project Manager",
    users: 15,
    permissions: ["Project Management", "Tranche Operations", "Reporting", "Team Management"],
    color: "text-blue-600"
  },
  {
    role: "Financial Analyst",
    users: 8,
    permissions: ["Financial Reporting", "Tranche Monitoring", "Compliance Review"],
    color: "text-green-600"
  },
  {
    role: "Carbon Verifier",
    users: 12,
    permissions: ["Document Review", "Verification Reports", "Compliance Status"],
    color: "text-purple-600"
  },
  {
    role: "Investment Officer",
    users: 6,
    permissions: ["Portfolio View", "Reporting Access", "Risk Assessment"],
    color: "text-orange-600"
  }
];

const activityLog = [
  { user: "Sarah Chen", action: "Created new project", timestamp: "2024-01-15 14:30", type: "create" },
  { user: "Michael Torres", action: "Updated financial report", timestamp: "2024-01-15 09:15", type: "update" },
  { user: "System Admin", action: "Added new user role", timestamp: "2024-01-14 16:20", type: "admin" },
  { user: "David Kim", action: "Completed carbon verification", timestamp: "2024-01-14 11:30", type: "complete" },
  { user: "Amara Okafor", action: "Approved tranche release", timestamp: "2024-01-13 15:45", type: "approve" }
];

function getStatusBadge(status: string) {
  const styles = {
    active: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20", 
    inactive: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
    suspended: "bg-red-500/10 text-red-600 hover:bg-red-500/20"
  };

  const labels = {
    active: "Active",
    pending: "Pending",
    inactive: "Inactive", 
    suspended: "Suspended"
  };

  const icons = {
    active: CheckCircle,
    pending: Clock,
    inactive: XCircle,
    suspended: XCircle
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <Badge variant="secondary" className={styles[status as keyof typeof styles]}>
      <Icon className="h-3 w-3 mr-1" />
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}

function getUserAvatar(name: string, avatar: string) {
  return (
    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
      {avatar}
    </div>
  );
}

export default function UserAccess() {
  return (
    <div className="p-6 space-y-6">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Access</h1>
            <p className="text-muted-foreground">Manage user permissions, roles, and access controls</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Role Settings
            </Button>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change} from last month</p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="settings">Access Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getUserAvatar(user.name, user.avatar)}
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.role}</p>
                            <p className="text-sm text-muted-foreground">{user.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.projects} projects</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rolePermissions.map((role, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`flex items-center gap-2 ${role.color}`}>
                        <Shield className="h-5 w-5" />
                        {role.role}
                      </CardTitle>
                      <Badge variant="outline">{role.users} users</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Permissions:</p>
                      <div className="space-y-1">
                        {role.permissions.map((permission, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-muted-foreground">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Session Timeout</p>
                      <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Password Policy</p>
                      <p className="text-sm text-muted-foreground">Minimum requirements</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">IP Whitelist</p>
                      <p className="text-sm text-muted-foreground">Restrict access by IP address</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">API Access</p>
                      <p className="text-sm text-muted-foreground">Manage API keys and tokens</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Audit Logging</p>
                      <p className="text-sm text-muted-foreground">Track all user actions</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}