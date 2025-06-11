import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Flame, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Topic } from '@/types/Topic';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextTopic, setNextTopic] = useState<Topic | null>(null);
  const [stats, setStats] = useState({
    completedTopics: 0,
    totalTopics: 0,
    currentStreak: 0,
    badges: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch total topics count
        const { data: topicsData } = await supabase
          .from('topics')
          .select('*');

        // Fetch user's completed topics
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('topic_id')
          .eq('user_id', user.id);

        // Fetch user's badges
        const { data: badgesData } = await supabase
          .from('user_badges')
          .select('badge_name')
          .eq('user_id', user.id);

        // Fetch user's current streak
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();

        const completedTopicIds = progressData?.map(p => p.topic_id) || [];
        
        // Find next recommended topic (first incomplete topic)
        const incompleteTopic = topicsData?.find(topic => 
          !completedTopicIds.includes(topic.id)
        );

        if (incompleteTopic) {
          setNextTopic({
            ...incompleteTopic,
            estimated_time: 30 // Default value for estimated_time
          });
        }

        setStats({
          completedTopics: completedTopicIds.length,
          totalTopics: topicsData?.length || 0,
          currentStreak: streakData?.current_streak || 0,
          badges: badgesData?.length || 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pt-20 container mx-auto px-4 py-8"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.email?.split('@')[0]}! 🎉
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Ready to continue your learning journey?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Topics Completed</p>
                    <p className="text-3xl font-bold">{stats.completedTopics}/{stats.totalTopics}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Current Streak</p>
                    <p className="text-3xl font-bold">{stats.currentStreak} days</p>
                  </div>
                  <Flame className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Badges Earned</p>
                    <p className="text-3xl font-bold">{stats.badges}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Progress</p>
                    <p className="text-3xl font-bold">{Math.round((stats.completedTopics / stats.totalTopics) * 100) || 0}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Next Recommended Topic */}
        {nextTopic && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <span className="text-3xl">{nextTopic.icon}</span>
                  Continue Learning: {nextTopic.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  {nextTopic.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline">{nextTopic.difficulty}</Badge>
                  <Badge variant="outline">⏱️ {nextTopic.estimated_time} min</Badge>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => navigate(`/learn/${nextTopic.id}`)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8 py-3 hover:shadow-lg transition-all duration-200"
                  >
                    Start Learning 🚀
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/learn')}
                  className="p-6 h-auto flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <BookOpen className="h-6 w-6" />
                  Browse All Topics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="p-6 h-auto flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Trophy className="h-6 w-6" />
                  View Achievements
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="p-6 h-auto flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <TrendingUp className="h-6 w-6" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
