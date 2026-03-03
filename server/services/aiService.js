import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOPIC_MAP = {
  'Frontend Developer': ['JavaScript', 'React', 'CSS', 'HTML', 'Performance', 'Testing'],
  'Backend Engineer': ['Node.js', 'Databases', 'APIs', 'System Design', 'Security', 'Caching'],
  'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'Databases', 'System Design', 'DevOps'],
  'DevOps Engineer': ['CI/CD', 'Docker', 'Kubernetes', 'Cloud', 'Monitoring', 'Linux'],
  'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'Data Processing', 'SQL', 'Visualization'],
};

export const generateQuestions = async (role, difficulty, experienceLevel, resumeText = '') => {
  const topics = TOPIC_MAP[role] || TOPIC_MAP['Full Stack Developer'];

  const prompt = `You are a senior technical interviewer. Generate exactly 5 interview questions for a ${experienceLevel} level ${role} candidate.

Difficulty: ${difficulty.toUpperCase()}
Topics to cover: ${topics.join(', ')}
${resumeText ? `Resume context: ${resumeText.slice(0, 500)}` : ''}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "...",
    "topic": "...",
    "difficulty": "${difficulty}",
    "expectedAnswer": "Brief expected answer points..."
  }
]

Make questions progressive: start with fundamentals, end with a problem-solving scenario.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = JSON.parse(response.choices[0].message.content);
  return content.questions || content;
};

export const evaluateAnswers = async (role, difficulty, questions, answers) => {
  const qaText = questions.map((q, i) => {
    const ans = answers.find(a => a.questionIndex === i);
    return `Q${i + 1} [${q.topic}]: ${q.question}\nAnswer: ${ans?.answer || '(No answer provided)'}`;
  }).join('\n\n');

  const prompt = `You are a senior technical interviewer evaluating a ${difficulty} level ${role} interview.

Interview Q&A:
${qaText}

Evaluate comprehensively and return ONLY valid JSON:
{
  "overallScore": <number 0-10>,
  "overall": "<2-3 sentence overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "topicAnalysis": [
    {
      "topic": "<topic name>",
      "score": <number 0-10>,
      "feedback": "<specific feedback>",
      "isWeak": <true if score < 6>
    }
  ]
}

Be fair, constructive, and specific. Score 0-10 where 7+ is passing.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content);
};
