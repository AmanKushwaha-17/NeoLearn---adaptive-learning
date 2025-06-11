
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotateCcw, Loader, Youtube } from 'lucide-react';
import { toast } from 'sonner';

interface VideoRecommendation {
  title: string;
  videoId: string;
  description: string;
  duration: string;
}

interface YouTubeVideoPlayerProps {
  topicTitle: string;
  userMasteryLevel: number;
  onVideoWatched: () => void;
}

const YouTubeVideoPlayer = ({ topicTitle, userMasteryLevel, onVideoWatched }: YouTubeVideoPlayerProps) => {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [videoRecommendation, setVideoRecommendation] = useState<VideoRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Determine default level based on user mastery
  const getDefaultLevel = (mastery: number) => {
    if (mastery === 0) return 'beginner';
    if (mastery < 0.3) return 'beginner';
    if (mastery < 0.7) return 'intermediate';
    return 'advanced';
  };

  useEffect(() => {
    console.log('useEffect triggered with:', { topicTitle, userMasteryLevel });
    const defaultLevel = getDefaultLevel(userMasteryLevel);
    setSelectedLevel(defaultLevel);
    setVideoRecommendation(null);
    setHasSearched(false);
    
    // Small timeout to ensure state updates before search
    setTimeout(() => {
      searchVideo(defaultLevel);
    }, 1000);
  }, [topicTitle, userMasteryLevel]);

  const getFallbackVideo = (level: string) => {
    const getRandomVideo = (videos: string[]) => {
      const randomIndex = Math.floor(Math.random() * videos.length);
      return videos[randomIndex];
    };
  
    // Extract video ID from YouTube URL
    const extractVideoId = (url: string) => {
      console.log('Extracting video ID from URL:', url);
      // Handle different YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : url;
      console.log('Extracted video ID:', videoId);
      return videoId;
    };
    // Algebra videos (original)
    const algebraBeginnerVideos = [
      'NybHckSEQBI',
      'V3dFHt9p5W8',
      'grnP3mduZkM'
    ];
  
    const algebraIntermediateVideos = [
      '0EnklHkVKXI',
      'bEMIicZhUCM',
      'vDqOoI-4Z6M'
    ];
  
    const algebraAdvancedVideos = [
      'LwCRRUa8yTU',
      'ab-ZrHKjGNo',
      'zPgfIOWVnF4'
    ];
  
    // Geometry basics videos
    const geometryBeginnerVideos = [
      'https://youtu.be/302eJ3TzJQU?si=X_OgppagL8cbOQgr',
      'https://youtu.be/k5etrWdIY6o?si=ReNV51kPPIjmnpwm',
      'https://youtu.be/F9EcdfyFXyw?si=LoLB1yLw_woil3ZC'
    ].map(extractVideoId);
  
    const geometryIntermediateVideos = [
      'https://youtu.be/WqzK3UAXaHs?si=9a4AQ0hGz6FLCbR6',
      'https://youtu.be/MD1Ob370TIA?si=RtRhOC4OADjZWnDS',
      'https://youtu.be/KtZai86htng?si=kSO26APh_B8GY2Si'
    ].map(extractVideoId);
  
    const geometryAdvancedVideos = [
      'https://youtu.be/KtZai86htng?si=j5-pDetlJ0daoP7O',
      'https://youtu.be/_n3KZR1DSEo?si=GqpQVnwN99spWB5W'
    ].map(extractVideoId);
  
    // Quadratic equations videos
    const quadraticBeginnerVideos = [
      'https://youtu.be/IWigvJcCAJ0?si=lUvtnOMn9RCEYBF6',
      'https://www.youtube.com/watch?v=IWigvJcCAJ0',
      'https://www.youtube.com/watch?v=PDIudNFEoGw'
    ].map(extractVideoId);
  
    const quadraticIntermediateVideos = [
      'https://www.youtube.com/watch?v=C206SNAXDGE',
      'https://www.youtube.com/watch?v=NC4fafUID2g',
      'https://www.youtube.com/watch?v=s0ZbFInqWjc'
    ].map(extractVideoId);
  
    const quadraticAdvancedVideos = [
      'https://www.youtube.com/watch?v=x-7unt67FL0',
      'https://www.youtube.com/watch?v=fGFh-LHD874',
      'https://www.youtube.com/watch?v=oSRRXm-N0Jg'
    ].map(extractVideoId);
  
    // Trigonometry videos
    const trigonometryBeginnerVideos = [
      'https://www.youtube.com/watch?v=PUB0TaZ7bhA',
      'https://www.youtube.com/watch?v=oG_ZbhyLkgE',
      'https://www.youtube.com/watch?v=pKsAC7UptNI'
    ].map(extractVideoId);
  
    const trigonometryIntermediateVideos = [
      'https://www.youtube.com/watch?v=G4TUYzFtHmk',
      'https://www.youtube.com/watch?v=y3eqCllxeAY',
      'https://www.youtube.com/watch?v=FQ4U2AQimCU'
    ].map(extractVideoId);
  
    const trigonometryAdvancedVideos = [
      'https://www.youtube.com/watch?v=pI11dYFay28',
      'https://www.youtube.com/watch?v=IoJqx9j1pYc',
      'https://www.youtube.com/watch?v=KIejV-LwzNc'
    ].map(extractVideoId);
  
    // Linear equation videos
    const linearEquationBeginnerVideos = [
      'https://www.youtube.com/watch?v=Fs5Fwlk7-Sc',
      'https://www.youtube.com/watch?v=7DPWeBszNSM',
      'https://www.youtube.com/watch?v=-t4l0MKGIgM'
    ].map(extractVideoId);
  
    const linearEquationIntermediateVideos = [
      'https://www.youtube.com/watch?v=utJ4dRvaVNo',
      'https://www.youtube.com/watch?v=DEi3A65kV3g',
      'https://www.youtube.com/watch?v=crJI4iZ_DbI'
    ].map(extractVideoId);
  
    const linearEquationAdvancedVideos = [
      'https://www.youtube.com/watch?v=ku2KKUzx3ZY',
      'https://www.youtube.com/watch?v=kYAoezPdwnE',
      'https://www.youtube.com/watch?v=bxNEuVrMyyE'
    ].map(extractVideoId);
  
    // Determine which topic's videos to use
    let beginnerVideos, intermediateVideos, advancedVideos;
  
    console.log('Current topic:', topicTitle);
  
    if (topicTitle.toLowerCase().includes('geometry')) {
      console.log('Using Geometry videos');
      beginnerVideos = geometryBeginnerVideos;
      intermediateVideos = geometryIntermediateVideos;
      advancedVideos = geometryAdvancedVideos;
    } else if (topicTitle.toLowerCase().includes('quadratic')) {
      console.log('Using Quadratic Equations videos');
      beginnerVideos = quadraticBeginnerVideos;
      intermediateVideos = quadraticIntermediateVideos;
      advancedVideos = quadraticAdvancedVideos;
    } else if (topicTitle.toLowerCase().includes('trigonometry')) {
      console.log('Using Trigonometry videos');
      beginnerVideos = trigonometryBeginnerVideos;
      intermediateVideos = trigonometryIntermediateVideos;
      advancedVideos = trigonometryAdvancedVideos;
    } else if (topicTitle.toLowerCase().includes('linear equation') || topicTitle.toLowerCase().includes('linear algebra')) {
      console.log('Using Linear Equation videos');
      beginnerVideos = linearEquationBeginnerVideos;
      intermediateVideos = linearEquationIntermediateVideos;
      advancedVideos = linearEquationAdvancedVideos;
    } else {
      // Default to algebra videos for any other topic
      console.log('Using Algebra videos (default)');
      beginnerVideos = algebraBeginnerVideos;
      intermediateVideos = algebraIntermediateVideos;
      advancedVideos = algebraAdvancedVideos;
    }
  
    // Select a random video ID based on level
    let videoId;
    if (level === 'beginner') {
      videoId = getRandomVideo(beginnerVideos);
      console.log('Selected beginner video ID:', videoId);
    } else if (level === 'intermediate') {
      videoId = getRandomVideo(intermediateVideos);
      console.log('Selected intermediate video ID:', videoId);
    } else {
      // For advanced and expert levels
      videoId = getRandomVideo(advancedVideos);
      console.log('Selected advanced video ID:', videoId);
    }
  
    return videoId;
  };

  const searchVideo = async (level: string) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      console.log('Searching for video:', { topic: topicTitle, level });
      throw new Error('Using direct fallback videos');
      
    } catch (error) {
      console.error('Error searching video:', error);
      
      // Use our custom fallback videos instead of showing error
      const fallbackVideoId = getFallbackVideo(level);
      console.log('Using fallback video ID:', fallbackVideoId);
      
      const fallbackVideo = {
        title: `${topicTitle} - Educational Tutorial (${level})`,
        videoId: fallbackVideoId,
        description: `Learn about ${topicTitle} in this educational video tailored for ${level} level learners`,
        duration: '10-15 minutes'
      };
      setVideoRecommendation(fallbackVideo);
      console.log('Setting video recommendation:', fallbackVideo);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (newLevel: string) => {
    setSelectedLevel(newLevel);
    searchVideo(newLevel);
  };

  const handleRefreshVideo = () => {
    if (selectedLevel) {
      searchVideo(selectedLevel);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl gap-3">
            <Youtube className="h-6 w-6 text-red-600" />
            {topicTitle} - Video Lesson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="videoLevel">Customize Video Level</Label>
              <div className="flex gap-3 items-center">
                <Select value={selectedLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select video difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - Basic concepts and simple explanations</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Detailed explanations with examples</SelectItem>
                    <SelectItem value="advanced">Advanced - In-depth analysis and complex scenarios</SelectItem>
                    <SelectItem value="expert">Expert - Comprehensive coverage with latest research</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleRefreshVideo}
                  disabled={loading}
                  className="px-3"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Recommended level based on your progress: {getDefaultLevel(userMasteryLevel)}
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Finding the best educational video for you...</span>
            </div>
          )}

          {!loading && hasSearched && videoRecommendation && (
            <>
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <iframe
                  key={videoRecommendation.videoId} 
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoRecommendation.videoId}?rel=0&modestbranding=1`}
                  title={videoRecommendation.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">
                  {videoRecommendation.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {videoRecommendation.description}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration: {videoRecommendation.duration}
                </p>
              </div>
            </>
          )}

          <Button 
            onClick={onVideoWatched} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg py-3"
          >
            I've Watched the Video! Continue →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default YouTubeVideoPlayer;



