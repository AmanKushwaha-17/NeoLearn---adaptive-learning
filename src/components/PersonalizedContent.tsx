
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileText, Loader, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

interface PersonalizedContentProps {
  topicTitle: string;
  onContentGenerated: () => void;
}

const PersonalizedContent = ({ topicTitle, onContentGenerated }: PersonalizedContentProps) => {
  const [contentLevel, setContentLevel] = useState('');
  const [preferences, setPreferences] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const generateContent = async () => {
    if (!contentLevel) {
      toast.error('Please select a content level');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf-content', {
        body: {
          topic: topicTitle,
          contentLevel: contentLevel,
          preferences: preferences || 'No specific preferences provided'
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedContent(data.content);
        setShowContent(true);
        toast.success('🎉 Personalized content generated successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    // Create a simple text file for now (PDF generation would require additional libraries)
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${topicTitle.replace(/\s+/g, '_')}_personalized_content.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Content downloaded successfully!');
  };

  if (showContent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Personalized Content: {topicTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {generatedContent}
              </pre>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={downloadAsPDF}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Content
              </Button>
              <Button
                onClick={onContentGenerated}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Continue to Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            Generate Personalized Content: {topicTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="contentLevel">Content Level</Label>
              <Select value={contentLevel} onValueChange={setContentLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred content level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - Basic concepts and simple explanations</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Detailed explanations with examples</SelectItem>
                  <SelectItem value="advanced">Advanced - In-depth analysis and complex scenarios</SelectItem>
                  <SelectItem value="expert">Expert - Comprehensive coverage with latest research</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferences">Your Learning Preferences (Optional)</Label>
              <Textarea
                id="preferences"
                placeholder="Describe your learning preferences, specific areas of interest, practical applications you want to focus on, examples you'd like to see, etc."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateContent}
              disabled={loading || !contentLevel}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating Personalized Content...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Personalized Content
                </>
              )}
            </Button>
            
            <Button
              onClick={onContentGenerated}
              variant="outline"
              className="flex-1"
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip to Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PersonalizedContent;
