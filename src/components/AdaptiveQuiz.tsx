// AdaptiveQuiz.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface Evaluation {
  score: number;
  feedback: string;
  correction: string;
}

interface AdaptiveQuizProps {
  topicId: string;
  topicTitle: string;
  onComplete: (newMastery: number) => void;
}

const AdaptiveQuiz = ({ topicId, topicTitle, onComplete }: AdaptiveQuizProps) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [mastery, setMastery] = useState(0.0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizLevel, setQuizLevel] = useState('easy');

  useEffect(() => {
    fetchUserMastery();
  }, [topicId, user]);

  const fetchUserMastery = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_mastery')
      .select('mastery_level')
      .eq('user_id', user.id)
      .eq('topic_id', topicId)
      .single();

    const currentMastery = data?.mastery_level || 0.0;
    setMastery(currentMastery);
    generateQuestion(currentMastery);
  };

  const generateQuestion = async (masteryLevel: number) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('adaptive-quiz', {
      body: {
        action: 'generate_question',
        topic: topicTitle,
        mastery: masteryLevel
      }
    });

    if (data?.success) {
      setCurrentQuestion(data.question);
      setQuizLevel(data.level);
    } else {
      toast.error('Failed to generate question');
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !user) {
      toast.error('Please select an answer');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('adaptive-quiz', {
      body: {
        action: 'evaluate_answer',
        question: currentQuestion.question,
        answer: selectedAnswer,
        correct_answer: currentQuestion.correct_answer,
        topic: topicTitle,
        userId: user.id,
        topicId,
        mastery
      }
    });

    if (data?.success) {
      setEvaluation(data.evaluation);
      setMastery(data.newMastery);
      setShowResult(true);
      setQuestionsAnswered(prev => prev + 1);
    } else {
      toast.error('Failed to evaluate answer');
    }
    setLoading(false);
  };

  const nextQuestion = () => {
    if (questionsAnswered >= 5) {
      onComplete(mastery);
      return;
    }
    setSelectedAnswer('');
    setEvaluation(null);
    setShowResult(false);
    generateQuestion(mastery);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Mastery Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div>
              <Brain className="mb-1" />
              <div className="font-bold">Mastery</div>
              <div>{Math.round(mastery * 100)}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm">Level</div>
              <div className="capitalize font-bold">{quizLevel}</div>
            </div>
          </div>
          <Progress value={mastery * 100} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Question Progress */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Zap className="inline mr-2" />
            Question {questionsAnswered + 1} of 5
          </CardTitle>
          <CardDescription>Level adjusts as you perform</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(questionsAnswered / 5) * 100} />
        </CardContent>
      </Card>

      {/* Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 border rounded">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>

            {evaluation && showResult && (
              <motion.div className="mt-4 p-3 border rounded">
                <div className="font-semibold">Score: {Math.round(evaluation.score * 100)}%</div>
                <div>{evaluation.feedback}</div>
                {evaluation.correction && evaluation.correction !== 'None needed' && (
                  <div className="text-sm mt-2 text-gray-600">
                    <strong>Correction:</strong> {evaluation.correction}
                  </div>
                )}
              </motion.div>
            )}

            <Button
              onClick={showResult ? nextQuestion : submitAnswer}
              className="mt-4 w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : showResult ? (questionsAnswered >= 5 ? 'Finish' : 'Next') : 'Submit'}
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default AdaptiveQuiz;
