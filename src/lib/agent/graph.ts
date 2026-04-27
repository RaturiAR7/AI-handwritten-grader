import { StateGraph, END } from "@langchain/langgraph";
import { ExamGradingState, ExamGradingStateType } from "../agent/states";
import { visionNode } from "./nodes/visionNode";
import { retrievalNode } from "./nodes/retrievalNode";
import { graderNode } from "./nodes/graderNode";

// --- Conditional edge: abort if a node set an error ---
// looks at the current state
function shouldContinue(state: ExamGradingStateType): "continue" | "abort" {
  return state.error ? "abort" : "continue";
}

// --- Build the graph ---
const workflow = new StateGraph(ExamGradingState)
  .addNode("vision", visionNode)
  .addNode("retrieval", retrievalNode)
  .addNode("grader", graderNode)

  // Entry point
  .addEdge("__start__", "vision")

  // After vision: check for errors before retrieval
  .addConditionalEdges("vision", shouldContinue, {
    continue: "retrieval",
    abort: END,
  })

  // After retrieval: check for errors before grading
  .addConditionalEdges("retrieval", shouldContinue, {
    continue: "grader",
    abort: END,
  })

  // Grading is the final step
  .addEdge("grader", END);
// Compiles the whole workflow
export const examGradingAgent = workflow.compile();
