# Handwritten Grader

An intelligent, agentic AI application built to grade handwritten exams. This project leverages **Google Gemini Vision**, **LangGraph**, and **ChromaDB** to automate the grading process with high accuracy and contextual understanding.

## Overview

The Handwritten Grader simplifies the grading workflow by:
1.  **Extracting** text from handwritten exam images using state-of-the-art vision models.
2.  **Retrieving** relevant context and rubrics from a vector database (RAG).
3.  **Evaluating** student answers against the rubric using an agentic reasoning workflow.

---

## Architecture Overview

The project is built with a modular, agent-centric architecture:

### 1. RAG Pipeline (`src/lib/rag`)
- **PDF Processing**: Extracts text from answer keys or rubrics using `pdf-parse`.
- **Vector Storage**: Uses **ChromaDB** to store and retrieve these rubrics.
- **Embedding**: Utilizes Google's Generative AI embedding models to convert text into searchable vectors.

### 2. Agentic Workflow (`src/lib/agent`)
Built with **LangGraph**, the grading logic follows a state-machine approach:
- **Vision Node**: Processes uploaded images (handwritten exams) and converts them into structured text.
- **Retrieval Node**: Takes the extracted text and queries ChromaDB for the most relevant sections of the rubric.
- **Grader Node**: Performs the final evaluation, assigning scores and providing feedback based on the retrieved context.

### 3. Frontend & API (`src/app`)
- **Next.js**: Provides the UI and serverless API endpoints (`/api/upload` and `/api/grade`).
- **Tailwind CSS**: Powering a modern, responsive design.

---

## Setup Instructions

### Prerequisites
- **Node.js** (v18+ recommended)
- **ChromaDB**: Must be running locally on port `8000`.
  - Simplest way to run: `docker run -p 8000:8000 chromadb/chroma`
- **Google AI API Key**: Obtain one from the [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd handwritten-grader
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.local` (or `.env.development`) file in the root:
    ```env
    GOOGLE_API_KEY="your_api_key_here"
    ```

4.  **Run the application**:
    ```bash
    npm run dev
    ```

---

## Usage Instructions

1.  **Initialize ChromaDB**: Ensure your ChromaDB instance is active.
2.  **Upload Rubric**:
    - Use the upload section to provide a **PDF** containing the answer key or grading rubric.
    - Assign an `Exam ID` to uniquely identify this rubric.
3.  **Grade Exams**:
    - Navigate to the grading section.
    - Enter the `Exam ID` corresponding to the rubric you uploaded.
    - Upload **images (PNG/JPG)** of the handwritten student papers.
4.  **Review Results**:
    - The system will process each image, perform retrieval-augmented grading, and display a detailed scorecard with scores and feedback.

---

## Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/)
- **AI Orchestration**: [LangGraph](https://langchain-ai.github.io/langgraphjs/)
- **LLM / Vision**: [Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/)
- **Vector Database**: [ChromaDB](https://www.trychroma.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
