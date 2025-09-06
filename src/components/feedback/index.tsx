"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { useLogger } from "@/hooks/use-logger";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { FrownIcon, MehIcon, SmileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Mood = "Sad" | "Neutral" | "Happy" | null;

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Survey {
  id: string;
  questions: Array<{
    id?: string;
    question: string;
  }>;
  appearance: {
    placeholder: string;
  };
}

const FeedbackModal = ({ open, onOpenChange }: FeedbackModalProps) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const posthog = usePostHog();
  const { logError } = useLogger();

  // Reset state when modal is closed
  const handleClose = () => {
    setSelectedMood(null);
    setFeedbackText("");
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      posthog.getActiveMatchingSurveys((surveys) => {
        if (surveys.length > 0) {
          setSurvey(surveys[0] as unknown as Survey);
        }
      });
    }
  }, [open, posthog]);

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!survey || !survey.questions[0]?.id) return;

    setIsSubmitting(true);
    const responseKey = `$survey_response_${survey.questions[0].id}`;
    const finalFeedback = selectedMood
      ? `[${selectedMood}] - ${feedbackText}`
      : feedbackText;

    try {
      await posthog.capture("survey sent", {
        $survey_id: survey.id,
        [responseKey]: finalFeedback,
        mood: selectedMood,
      });
      setSelectedMood(null);
      setFeedbackText("");
      onOpenChange(false);
    } catch (error) {
      logError("Failed to submit feedback", error, {
        surveyId: survey.id,
        mood: selectedMood,
        action: "feedback_submission",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setFeedbackText(newText);
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] py-4 px-5">
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle className="text-lg font-medium text-gray-700">
            Leave feedback
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            We&apos;d love to hear what went well or how we can improve your
            product experience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="feedback"
              name="feedback"
              value={feedbackText}
              onChange={handleTextareaChange}
              placeholder="Your feedback here"
              required
              className="min-h-[100px] max-h-[500px] focus-visible:ring-offset-0 focus-visible:ring-0 text-sm"
            />
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full h-8 w-8 p-0",
                  selectedMood === "Sad" && "bg-muted"
                )}
                onClick={() =>
                  handleMoodSelect(selectedMood === "Sad" ? null : "Sad")
                }
              >
                <FrownIcon
                  className={cn(
                    "h-4 w-4 text-gray-500",
                    selectedMood === "Sad" && "text-red-500"
                  )}
                />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full h-8 w-8 p-0",
                  selectedMood === "Neutral" && "bg-muted"
                )}
                onClick={() =>
                  handleMoodSelect(
                    selectedMood === "Neutral" ? null : "Neutral"
                  )
                }
              >
                <MehIcon
                  className={cn(
                    "h-4 w-4 text-gray-500",
                    selectedMood === "Neutral" && "text-yellow-500"
                  )}
                />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full h-8 w-8 p-0",
                  selectedMood === "Happy" && "bg-muted"
                )}
                onClick={() =>
                  handleMoodSelect(selectedMood === "Happy" ? null : "Happy")
                }
              >
                <SmileIcon
                  className={cn(
                    "h-4 w-4 text-gray-500",
                    selectedMood === "Happy" && "text-green-500"
                  )}
                />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                className="rounded-full"
                disabled={isSubmitting || !feedbackText.trim()}
              >
                {isSubmitting ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const Feedback = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className=" rounded-2xl text-gray-500 text-xs"
        onClick={() => setOpen(true)}
      >
        Feedback
      </Button>
      <FeedbackModal open={isOpen} onOpenChange={setOpen} />
    </>
  );
};
