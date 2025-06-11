
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, BookOpen, Brain } from 'lucide-react';
import { toast } from 'sonner';
import type { Topic } from '@/types/Topic';
import AdaptiveQuiz from '@/components/AdaptiveQuiz';
import PersonalizedContent from '@/components/PersonalizedContent';
import YouTubeVideoPlayer from '@/components/YouTubeVideoPlayer';

const TopicPlayer = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userMasteryLevel, setUserMasteryLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  const steps = ['Watch Video', 'Personalized Explanation', 'Take Adaptive Quiz'];
  const stepIcons = [Play, BookOpen, Brain];

  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId || !user) return;

      try {
        const { data: topicData, error } = await supabase
          .from('topics')
          .select('*')
          .eq('id', topicId)
          .single();

        if (error) throw error;

        // Get user mastery level for this topic
        const { data: masteryData } = await supabase
          .from('user_mastery')
          .select('mastery_level')
          .eq('user_id', user.id)
          .eq('topic_id', topicId)
          .single();

        if (topicData) {
          setTopic({
            ...topicData,
            estimated_time: 30
          });
          setUserMasteryLevel(masteryData?.mastery_level || 0);
        } else {
          toast.error('Topic not found');
          navigate('/learn');
        }
      } catch (error) {
        console.error('Error fetching topic:', error);
        toast.error('Failed to load topic');
        navigate('/learn');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId, user, navigate]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizComplete = async (newMastery: number) => {
    if (!user || !topic) return;

    try {
      // Mark topic as completed
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          topic_id: topic.id,
        });

      if (progressError && !progressError.message.includes('duplicate')) {
        throw progressError;
      }

      // Check if this is their first completion for a badge
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id);

      if (existingProgress && existingProgress.length === 1) {
        await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_name: 'First Steps',
          });
        toast.success('🏆 Badge earned: First Steps!');
      }

      // Award mastery badges based on new mastery level
      if (newMastery >= 0.9) {
        await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_name: 'Master',
          });
        toast.success('🏆 Badge earned: Master!');
      } else if (newMastery >= 0.7) {
        await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_name: 'Expert',
          });
        toast.success('🏆 Badge earned: Expert!');
      }

      toast.success(`🏆 Topic completed! Mastery: ${Math.round(newMastery * 100)}%`);
      
      setTimeout(() => {
        navigate('/learn');
      }, 2000);

    } catch (error: any) {
      console.error('Error completing topic:', error);
      toast.error("Something went wrong. Please try again!");
    }
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

  const renderStep = () => {
    if (!topic) return null;

    switch (currentStep) {
      case 0: // Video
        return (
          <motion.div variants={itemVariants}>
            <YouTubeVideoPlayer
              topicTitle={topic.title}
              userMasteryLevel={userMasteryLevel}
              onVideoWatched={handleNextStep}
            />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            </div>
          </motion.div>
        );

      case 1: // Personalized Explanation
        return (
          <motion.div variants={itemVariants}>
            <PersonalizedContent 
              topicTitle={topic.title}
              onContentGenerated={handleNextStep}
            />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Video
              </Button>
            </div>
          </motion.div>
        );

      case 2: // Adaptive Quiz
        return (
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl gap-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                  Adaptive Quiz: {topic.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  AI-powered questions that adapt to your skill level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-6">
                  <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Explanation
                  </Button>
                </div>
                <AdaptiveQuiz 
                  topicId={topic.id}
                  topicTitle={topic.title}
                  onComplete={handleQuizComplete}
                />
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
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

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
            <Button onClick={() => navigate('/learn')}>Return to Learning</Button>
          </Card>
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
        className="pt-20 container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/learn')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Button>
          
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{topic?.icon}</span>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{topic?.title}</h1>
                    <p className="text-indigo-100 text-lg">
                      Your mastery: {Math.round(userMasteryLevel * 100)}% • {topic?.estimated_time} min
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  {React.createElement(stepIcons[currentStep], { className: "h-5 w-5" })}
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
                  </span>
                </div>
                <span className="text-lg text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        {renderStep()}
      </motion.div>
    </div>
  );
};

export default TopicPlayer;
