
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Shield, Bell, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, signOut } = useAuth();

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in demo mode');
  };

  const handleExportData = () => {
    toast.success('Data export feature coming soon!');
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
            Settings ⚙️
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your learning experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Appearance Settings */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark Mode
                    </Label>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Switch between light and dark themes
                    </div>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🎨</span>
                    <span className="font-semibold">Theme Preview</span>
                  </div>
                  <p className="text-blue-100 text-sm">
                    This is how your interface looks with the current theme settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="learning-reminders" className="text-base">
                      Learning Reminders
                    </Label>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Get reminded to continue your learning streak
                    </div>
                  </div>
                  <Switch id="learning-reminders" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievement-notifications" className="text-base">
                      Achievement Notifications
                    </Label>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Get notified when you earn new badges
                    </div>
                  </div>
                  <Switch id="achievement-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-progress" className="text-base">
                      Weekly Progress
                    </Label>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Receive weekly progress summaries
                    </div>
                  </div>
                  <Switch id="weekly-progress" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Settings */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</div>
                  <div className="font-medium">{user?.email}</div>
                </div>

                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full"
                >
                  Export My Data
                </Button>

                <Button
                  onClick={() => window.location.href = '/profile'}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div variants={itemVariants} className="h-full">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <CardDescription>
                  Control your privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics" className="text-base">
                      Analytics
                    </Label>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Help us improve by sharing usage data
                    </div>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="personalization" className="text-base">
                      Personalized Recommendations
                    </Label>
                    <div className="text-[0.8rem] text-muted-foreground">
                      Get topic suggestions based on your progress
                    </div>
                  </div>
                  <Switch id="personalization" defaultChecked />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    className="w-full flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* App Info */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">NeoLearn v1.0</h3>
              <p className="text-blue-100 mb-4">
                Your AI-powered learning companion
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-blue-100">
                <span>© 2025 Lanzers</span>
          
                <span>Made with 🤍 from Lanzers</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings;
