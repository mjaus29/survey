"use client";

import SignOutButton from "./SignOutButton";
import { Button } from "./ui/button";

interface Question {
  id: number;
  title: string;
  description: string;
  type: string;
}

interface Answer {
  id: number;
  questionId: number;
  response: string;
  question: Question;
}

interface SurveyReviewProps {
  review: Answer[];
  setSubmitted: (value: boolean) => void;
}

export default function SurveyReview({
  review,
  setSubmitted,
}: SurveyReviewProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-500">
      <SignOutButton />
      <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Thank You!</h1>

        <p className="mb-6">Your responses have been recorded successfully.</p>

        <h2 className="text-lg font-semibold mb-2">Your Responses</h2>

        <div className="space-y-3 mb-6">
          {review
            .slice()
            .sort((a, b) => a.questionId - b.questionId)
            .map((r) => (
              <div key={r.id} className="p-3">
                <div className="font-medium">{r.question.title}</div>

                <div className="mt-1 text-gray-600">
                  {r.question.type === "checkbox"
                    ? r.response.split(",").join(", ")
                    : r.response}
                </div>
              </div>
            ))}
        </div>

        <div className="flex justify-self-center">
          <Button
            onClick={() => setSubmitted(false)}
            className="bg-red-500 hover:bg-red-700 text-white rounded-full"
          >
            Edit Responses
          </Button>
        </div>
      </div>
    </div>
  );
}
