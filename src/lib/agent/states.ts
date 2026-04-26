import { Annotation } from "@langchain/langgraph";
import {
  ExtractedAnswer,
  GradeResult,
  graderNodeParams,
} from "@/constants/index";

export const ExamGradingState = Annotation.Root({
  // Input
  examId: Annotation<string>(),
  imagesBase64: Annotation<string[]>(),
  modelName: Annotation<string>(),

  // Vision node output
  extractedAnswers: Annotation<ExtractedAnswer[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),

  // Retrieval node output
  ragResults: Annotation<graderNodeParams[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),

  // Grading node output
  gradedResults: Annotation<GradeResult[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),

  // Error handling
  error: Annotation<string | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
});

export type ExamGradingStateType = typeof ExamGradingState.State;
