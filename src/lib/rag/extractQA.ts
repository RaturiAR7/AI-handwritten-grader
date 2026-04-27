export function extractQA(text: string) {
  const lines = text.split("\n");

  const qa: { questionId: string; answer: string }[] = [];

  for (const line of lines) {
    ////like->  1), 1., or 1:
    const match = line.match(/^(\d+)[\)\.\:]\s*(.*)/);

    if (match) {
      qa.push({
        questionId: `Q${match[1]}`,
        answer: match[2].trim(),
      });
    }
  }

  return qa;
}
