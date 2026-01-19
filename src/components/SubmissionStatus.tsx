import React, { useState, useEffect, useRef } from 'react';
import { useQuestSubmission } from '../hooks/useApi';
import { Submission } from '../types';
import { useToast } from '../hooks/useToast';
import { useAnimation } from '../contexts/AnimationContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, Loader2, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

interface SubmissionStatusProps {
  questId: string;
  onComplete?: (submission: Submission) => void;
}

const SubmissionStatus: React.FC<SubmissionStatusProps> = ({ questId, onComplete }) => {
  const { xpGained, error: toastError, success: toastSuccess } = useToast();
  const { triggerLevelUp, triggerConfetti } = useAnimation();
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [prevLevel, setPrevLevel] = useState(user?.level || 1);

  const { 
    submitSolution, 
    submitting, 
    isPolling, 
    submission, 
    error, 
    isEvaluated, 
    reset 
  } = useQuestSubmission();

  useEffect(() => {
    if (isEvaluated && submission) {
      xpGained(submission.xpAwarded || 0, `Quest "${questId}" Evaluation`);
      toastSuccess('Evaluation Complete', 'Lean Sensei has reviewed your steps.');
      triggerConfetti();
      
      // Check for level up
      if (user && user.level > prevLevel) {
        triggerLevelUp(user.level);
        setPrevLevel(user.level);
      }
    }
  }, [isEvaluated, submission, user]);

  useEffect(() => {
    if (error) {
       toastError('Submission Error', error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPrevLevel(user?.level || 1);
    await submitSolution(questId, content);
  };

  const handleRetry = () => {
    reset();
    setContent('');
  };

  // State: Evaluated (Success)
  if (isEvaluated && submission) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 className="w-24 h-24 text-emerald-600" />
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
             <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-lg">
                <Sparkles className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-emerald-900">Analysis Complete!</h3>
                <p className="text-emerald-700 text-sm">Your solution has been evaluated by Lean Sensei.</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">XP Awarded</p>
                <p className="text-2xl font-black text-emerald-700">+{submission.xpAwarded} XP</p>
             </div>
             <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Evaluation Date</p>
                <p className="text-sm font-bold text-emerald-700">
                   {submission.evaluatedAt ? new Date(submission.evaluatedAt).toLocaleDateString() : 'Just now'}
                </p>
             </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm">
             <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                <ChevronRight className="w-4 h-4 text-emerald-500 mr-1" />
                Sensei's Feedback
             </h4>
             <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                "{submission.feedback || "Great job applying Lean principles to this challenge!"}"
             </div>
          </div>
        </div>

        <div className="flex space-x-3">
           <button 
             onClick={handleRetry}
             className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center"
           >
              <RefreshCw className="w-4 h-4 mr-2" /> Try Another Approach
           </button>
           {onComplete && (
             <button 
                onClick={() => onComplete(submission)}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center shadow-lg shadow-red-200"
             >
                Finish Quest <ChevronRight className="w-4 h-4 ml-2" />
             </button>
           )}
        </div>
      </div>
    );
  }

  // State: Loading / Polling
  if (submitting || isPolling) {
    return (
      <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center text-center animate-pulse">
        <div className="relative mb-6">
           <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
           <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {submitting ? 'Transmitting Solution...' : 'Gemini AI is Analyzing...'}
        </h3>
        <p className="text-slate-500 max-w-xs mx-auto text-sm">
          Please wait while Lean Sensei evaluates your solution based on standard industry practices.
        </p>
      </div>
    );
  }

  // State: Idle (Form)
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Submit Your Solution</h3>
          <p className="text-xs text-slate-500">Describe how you would solve this Lean challenge.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your detailed steps and rationale here..."
            className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 transition-all"
          />
          <div className="mt-2 flex justify-between items-center px-1">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               {content.length} characters
             </span>
             <p className="text-[10px] text-blue-500 font-bold flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Evaluated by Gemini AI
             </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-xs text-red-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>Submit for Review <ChevronRight className="w-4 h-4 ml-2" /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default SubmissionStatus;