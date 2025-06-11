import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Topic } from '@/types/Topic';

interface UserMastery {
  topic_id: string;
  mastery_level: number;
}

const Learn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [userMastery, setUserMastery] = useState<UserMastery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!user) return;

      try {
        // Fetch all topics
        const { data: topicsData } = await supabase
          .from('topics')
          .select('*')
          .order('difficulty');

        // Fetch completed topics
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('topic_id')
          .eq('user_id', user.id);

        // Fetch user mastery levels
        const { data: masteryData } = await supabase
          .from('user_mastery')
          .select('topic_id, mastery_level')
          .eq('user_id', user.id);

        const formattedTopics = topicsData?.map(topic => ({
          ...topic,
          estimated_time: 30 // Default value for estimated_time if null
        })) || [];

        setTopics(formattedTopics);
        setCompletedTopics(progressData?.map(p => p.topic_id) || []);
        setUserMastery(masteryData || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
        toast.error('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [user]);

  const getMasteryLevel = (topicId: string) => {
    const mastery = userMastery.find(m => m.topic_id === topicId);
    return mastery ? mastery.mastery_level : 0;
  };

  const getMasteryLabel = (level: number) => {
    if (level === 0) return 'Not Started';
    if (level < 0.3) return 'Beginner';
    if (level < 0.7) return 'Intermediate';
    return 'Advanced';
  };

  const getMasteryColor = (level: number) => {
    if (level === 0) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    if (level < 0.3) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (level < 0.7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

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
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Learning Topics 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a topic to start your learning journey
          </p>
        </motion.div>

        {/* Progress Summary */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Your Progress</h3>
                  <p className="text-blue-100">
                    {completedTopics.length} of {topics.length} topics completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {Math.round((completedTopics.length / topics.length) * 100) || 0}%
                  </div>
                  <p className="text-blue-100 text-sm">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {topics.map((topic) => {
            const isCompleted = completedTopics.includes(topic.id);
            const masteryLevel = getMasteryLevel(topic.id);
            
            return (
              <motion.div key={topic.id} variants={itemVariants}>
                <Card className={`h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{topic.icon}</span>
                        <div>
                          <CardTitle className={`text-lg flex items-center gap-2 ${
                            isCompleted ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'
                          }`}>
                            {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {topic.title}
                          </CardTitle>
                          <CardDescription className={isCompleted ? 'text-green-700 dark:text-green-400' : ''}>
                            {topic.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={getMasteryColor(masteryLevel)}>
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {getMasteryLabel(masteryLevel)} ({Math.round(masteryLevel * 100)}%)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => navigate(`/learn/${topic.id}`)}
                        className={`w-full ${
                          isCompleted
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-lg'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review Topic
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Learning
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {topics.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No topics available yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Check back later for new learning content!
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Back to Dashboard
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Learn;
