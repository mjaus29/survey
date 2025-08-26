"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import SignOutButton from "@/components/SignOutButton";
import SurveyReview from "@/components/SurveyReview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Question {
  id: number;
  code: string;
  surveyId: number;
  title: string;
  description: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface Answer {
  id: number;
  questionId: number;
  response: string;
  question: Question;
}

function getFieldSchema(question: Question): z.ZodTypeAny {
  const { type, required } = question;

  if (type === "currency") {
    const base = z.preprocess(
      (val) => Number(val),
      z.number({ message: "Please enter a valid number." })
    );

    return required ? base : base.optional();
  }

  if (type === "checkbox") {
    const arr = z.array(z.string());

    return required
      ? arr.min(1, { message: "Please select at least one option." })
      : arr;
  }

  const str = z.string();

  return required
    ? str.refine((val) => val !== "", { message: "This field is required" })
    : str;
}

function renderFormField(
  question: Question,
  field: { value: unknown; onChange: (value: unknown) => void }
): ReactNode {
  const { type, options = [] } = question;

  switch (type) {
    case "checkbox":
      return (
        <div>
          {options.map((opt) => (
            <label key={opt}>
              <Checkbox
                checked={
                  Array.isArray(field.value) && field.value.includes(opt)
                }
                onCheckedChange={(checked) =>
                  field.onChange(
                    checked
                      ? [...(field.value as string[]), opt]
                      : (field.value as string[]).filter((v) => v !== opt)
                  )
                }
              />
              {opt}{" "}
            </label>
          ))}
        </div>
      );
    case "radio":
      return (
        <RadioGroup
          value={String(field.value) || ""}
          onValueChange={field.onChange}
        >
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value={opt} />
              <span>{opt}</span>
            </label>
          ))}
        </RadioGroup>
      );
    case "select":
      return (
        <Select
          value={String(field.value || "")}
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>

          <SelectContent className="bg-white">
            {options.map((opt, i) => (
              <SelectItem key={i} value={opt.trim()}>
                {opt.trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return (
        <Input
          type={
            type === "currency" ? "number" : type === "date" ? "date" : "text"
          }
          {...field}
          value={String(field.value || "")}
        />
      );
  }
}

export default function SurveyForm() {
  const formSubmitIntentRef = useRef(false);

  const [questions, setQuestions] = useState<Question[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState<
    Record<string, z.ZodTypeAny>
  >({});

  const [currentStep, setCurrentStep] = useState(0);

  const [submitted, setSubmitted] = useState<boolean | null>(null);

  const [review, setReview] = useState<Answer[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function loadSurveyData() {
      const authResp = await fetch("/api/auth", { credentials: "include" });

      const { authenticated } = await authResp.json();

      if (!authenticated) {
        router.replace("/auth");
        return;
      }

      try {
        const dataResp = await fetch("/api/survey/");
        if (!dataResp.ok) {
          setSubmitted(false);
          return;
        }

        const { questions = [], answers = [] } = await dataResp.json();

        setQuestions(questions);

        const schema = Object.fromEntries(
          questions.map((q: Question) => [q.id, getFieldSchema(q)])
        );

        setDynamicSchema(schema);

        setReview(answers);

        setSubmitted(answers.length > 0);
      } catch {
        setErrorMessage("Failed to load survey data.");
        setSubmitted(false);
      }
    }

    loadSurveyData();
  }, [router]);

  useEffect(() => {
    if (!submitted) {
      setCurrentStep(0);
    }
  }, [submitted]);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(z.object(dynamicSchema)),
    defaultValues: {},
    mode: "onChange",
  });

  useEffect(() => {
    if (!questions.length) return;

    const getDefault = (q: Question): unknown => {
      const found = review.find((a) => a.questionId === q.id);

      if (found) {
        if (q.type === "checkbox") return String(found.response).split(".");
        if (["currency"].includes(q.type)) return Number(found.response);

        return found.response;
      }

      if (q.type === "checkbox") return [];
    };

    const defaultValues = Object.fromEntries(
      questions.map((q) => [q.id, getDefault(q)])
    );

    form.reset(defaultValues);
  }, [questions, review, form]);

  async function handleNext() {
    formSubmitIntentRef.current = false;

    const currentQuestion = questions[currentStep];

    await form.trigger(`${currentQuestion.id}`);

    if (form.getFieldState(`${currentQuestion.id}`).error) return;

    if (currentStep < questions.length - 1) setCurrentStep(currentStep + 1);
  }

  async function handleSubmit() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const formValues = form.getValues();

      const payload = questions.map((q) => ({
        questionId: q.id,
        response:
          q.type === "checkbox" && Array.isArray(formValues[q.id])
            ? (formValues[q.id] as string[]).join(",")
            : String(formValues[q.id] ?? ""),
      }));

      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to submit survey.");
        return;
      }

      const reviewRes = await fetch("/api/survey");
      const { answers = [] } = await reviewRes.json();

      setReview(answers);
      setSubmitted(true);
    } catch {
      setErrorMessage("Failed to submit survey.");
    } finally {
      setIsLoading(false);
    }
  }

  return !questions.length || submitted === null ? (
    <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner size={48} inverted={true} />
    </div>
  ) : submitted ? (
    <SurveyReview review={review} setSubmitted={setSubmitted} />
  ) : (
    <div className="flex justify-center items-center min-h-screen">
      <SignOutButton />
      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              currentStep === questions.length - 1 &&
              formSubmitIntentRef.current
            ) {
              const isValid = await form.trigger();
              if (isValid) form.handleSubmit(handleSubmit)(e);
            }
          }}
          className="flex max-h-[800px] w-full max-w-[580px] flex-col justify-center space-y-6 p-4 lg:h-full lg:space-y-8 lg:p-0"
        >
          <h1 className="text-3xl font-bold">Survey</h1>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{
                width: `${((currentStep + 1) / questions.length) * 100}%`,
              }}
            ></div>

            <p className="text-sm text-gray-500 text-right mt-1">
              Question {currentStep + 1} of {questions.length}
            </p>
          </div>

          <div className="min-h-[175px]">
            {questions.length > 0 && currentStep < questions.length && (
              <FormField
                key={questions[currentStep].id}
                control={form.control}
                name={`${questions[currentStep].id}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex h-auto flex-col justify-center rounded-xl border-white-300 px-4 py-4 shadow-md">
                      <FormLabel>{questions[currentStep].title}</FormLabel>

                      <p className="text-sm text-gray-500 mb-2">
                        {questions[currentStep].description}
                      </p>

                      <FormControl>
                        {renderFormField(questions[currentStep], field)}
                      </FormControl>
                    </div>
                    <FormMessage className="text-red-500 ml-4" />
                  </FormItem>
                )}
              />
            )}

            {errorMessage && (
              <p className="text-red-500 mt-2">*{errorMessage}</p>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isLoading}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 rounded-full"
            >
              Previous
            </Button>

            {currentStep < questions.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-700 text-white px-6 rounded-full"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={() => (formSubmitIntentRef.current = true)}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-700 text-white px-6 rounded-full"
              >
                Submit {isLoading && <LoadingSpinner className="ml-2" />}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
