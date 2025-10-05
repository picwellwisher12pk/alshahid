import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Clock, CheckCircle } from 'lucide-react';

// Mock data - in a real app, this would come from your API
const stats = [
  { name: 'Total Trial Requests', value: '24', icon: Users, change: '+12%', changeType: 'increase' },
  { name: 'Pending Trials', value: '8', icon: Clock, change: '+2', changeType: 'increase' },
  { name: 'Completed Trials', value: '16', icon: CheckCircle, change: '+4', changeType: 'increase' },
  { name: 'New Messages', value: '12', icon: MessageSquare, change: '-3', changeType: 'decrease' },
];

export function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Trial Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">Quran for Beginners</p>
                  </div>
                  <div className="text-sm text-gray-500">2 days ago</div>
                </div>
              ))}
              <div className="mt-4 text-sm font-medium text-primary">
                <a href="/dashboard/trial-requests">View all trial requests →</a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      I'm interested in learning more about your advanced Tajweed course...
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">1d</div>
                </div>
              ))}
              <div className="mt-4 text-sm font-medium text-primary">
                <a href="/dashboard/contact-messages">View all messages →</a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
