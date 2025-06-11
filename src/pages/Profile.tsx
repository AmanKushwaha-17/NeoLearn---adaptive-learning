
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, BookOpen, Flame, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  username: string;
  avatar: string;
}

interface Badge {
  id: string;
  badge_name: string;
  earned_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ username: '', avatar: '🧑‍🎓' });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [completedTopics, setCompletedTopics] = useState(0);
  const [totalTopics, setTotalTopics] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile({
            username: profileData.username || user.email?.split('@')[0] || '',
            avatar: profileData.avatar || '🧑‍🎓',
          });
        } else {
          // Create profile if it doesn't exist
          const { error } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              username: user.email?.split('@')[0] || '',
              avatar: '🧑‍🎓',
            });
          
          if (error) console.error('Error creating profile:', error);
        }

        // Fetch badges
        const { data: badgesData } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false });

        // Fetch progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        // Fetch total topics
        const { data: topicsData } = await supabase
          .from('topics')
          .select('id');

        setBadges(badgesData || []);
        setCompletedTopics(progressData?.length || 0);
        setTotalTopics(topicsData?.length || 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: profile.username,
          avatar: profile.avatar,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const getBadgeEmoji = (badgeName: string) => {
    const badgeEmojis: { [key: string]: string } = {
      'First Steps': '🥇',
      'Quick Learner': '⚡',
      'Math Master': '🧮',
      'Streak Master': '🔥',
      'Topic Explorer': '🗺️',
    };
    return badgeEmojis[badgeName] || '🏆';
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
            Your Profile 👤
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account and view your achievements
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Information
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4 text-4xl">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                      {profile.avatar}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="avatar">Avatar Emoji</Label>
                        <Input
                          id="avatar"
                          value={profile.avatar}
                          onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                          className="mt-1"
                          placeholder="🧑‍🎓"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveProfile} className="flex-1">
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {profile.username}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats and Badges */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Learning Stats */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Learning Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{completedTopics}</div>
                    <div className="text-blue-100 text-sm">Topics Completed</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                    <Trophy className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{badges.length}</div>
                    <div className="text-green-100 text-sm">Badges Earned</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
                    <Flame className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {Math.round((completedTopics / totalTopics) * 100) || 0}%
                    </div>
                    <div className="text-purple-100 text-sm">Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
                <CardDescription>
                  Achievements you've unlocked on your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {badges.map((badge) => (
                      <motion.div
                        key={badge.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg"
                      >
                        <div className="text-2xl">{getBadgeEmoji(badge.badge_name)}</div>
                        <div>
                          <h4 className="font-bold">{badge.badge_name}</h4>
                          <p className="text-yellow-100 text-sm">
                            Earned {new Date(badge.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏆</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No badges yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Start completing topics to earn your first badge!
                    </p>
                    <Button
                      onClick={() => window.location.href = '/learn'}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Start Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
