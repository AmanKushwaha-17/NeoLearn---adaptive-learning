
import { Card, CardContent } from '@/components/ui/card';
import TutorAvatar from './TutorAvatar';

interface TutorMessageProps {
  message: string;
}

const TutorMessage = ({ message }: TutorMessageProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg animate-fade-in">
      <CardContent className="flex items-start space-x-4 pt-6">
        <TutorAvatar size="sm" className="mt-1 flex-shrink-0" />
        <div className="flex-1">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-white leading-relaxed">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorMessage;
