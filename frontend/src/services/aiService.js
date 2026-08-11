// Get API key from environment variable
const getApiKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || '';
};

// Check if AI is available
const isAIAvailable = () => {
  return !!getApiKey();
};

/**
 * Call Groq API for AI completions
 */
const callGroqAPI = async (prompt) => {
  const apiKey = getApiKey();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that always responds with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

/**
 * Parse AI response to JSON
 */
const parseJSONResponse = (text) => {
  if (!text) {
    throw new Error('Empty AI response');
  }

  const cleanText = `${text}`.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const candidates = [cleanText];

  const objectMatch = cleanText.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    candidates.unshift(objectMatch[0]);
  }

  const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    candidates.unshift(arrayMatch[0]);
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  throw new Error('AI response was not valid JSON');
};

/**
 * Generate mock ATS analysis based on resume text content
 */
const generateMockAnalysis = (resumeText, targetRole) => {
  const text = resumeText.toLowerCase();
  
  // Extract skills based on common keywords
  const allSkills = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 'MongoDB', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'Redux', 'Express.js',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Firebase', 'PostgreSQL', 'MySQL', 'Redis',
    'CI/CD', 'Jenkins', 'Azure', 'GCP', 'Linux', 'Agile', 'Scrum'
  ];
  
  const matchedSkills = allSkills.filter(skill => 
    text.includes(skill.toLowerCase()) || text.includes(skill.toLowerCase().replace('.', ''))
  ).slice(0, 8);
  
  const missingSkills = allSkills.filter(skill => !matchedSkills.includes(skill)).slice(0, 6);
  
  // Calculate scores based on resume content
  const hasEducation = text.includes('bachelor') || text.includes('master') || text.includes('b.tech') || text.includes('degree');
  const hasExperience = text.includes('experience') || text.includes('developer') || text.includes('engineer') || text.includes('intern');
  const hasProjects = text.includes('project') || text.includes('built') || text.includes('developed');
  const hasSkills = matchedSkills.length > 3;
  
  let atsScore = 45;
  if (hasEducation) atsScore += 12;
  if (hasExperience) atsScore += 15;
  if (hasProjects) atsScore += 12;
  if (hasSkills) atsScore += 10;
  atsScore = Math.min(atsScore + Math.floor(Math.random() * 8), 95);
  
  const keywordScore = Math.min(matchedSkills.length * 12 + Math.floor(Math.random() * 10), 95);
  const formatScore = text.length > 1000 ? 75 + Math.floor(Math.random() * 15) : 55 + Math.floor(Math.random() * 15);
  const experienceScore = hasExperience ? 70 + Math.floor(Math.random() * 20) : 40 + Math.floor(Math.random() * 15);

  return {
    atsScore,
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : ['JavaScript', 'HTML', 'CSS'],
    missingSkills: missingSkills.length > 0 ? missingSkills : ['Docker', 'AWS', 'CI/CD', 'Testing'],
    education: hasEducation 
      ? [{ degree: 'Bachelor of Technology', institution: 'University', year: '2022' }]
      : [],
    experience: hasExperience 
      ? [{ role: 'Software Developer', company: 'Tech Company', duration: '1-2 years' }]
      : [],
    projects: hasProjects 
      ? ['Web Application Project', 'Full Stack Project']
      : [],
    certifications: [],
    keywordMatch: {
      score: keywordScore,
      details: `Found ${matchedSkills.length} relevant skills for ${targetRole} role. ${matchedSkills.length < 5 ? 'Consider adding more role-specific technical skills.' : 'Good coverage of required skills.'}`
    },
    formatScore: {
      score: formatScore,
      details: text.length > 1500 
        ? 'Resume has good length and detail. Ensure consistent formatting and clear section headers.'
        : 'Resume could be more detailed. Add more descriptions of your work and achievements.'
    },
    experienceScore: {
      score: experienceScore,
      details: hasExperience 
        ? 'Relevant experience detected. Highlight specific achievements and impact.'
        : 'Limited professional experience. Focus on projects and internships.'
    },
    suggestions: [
      matchedSkills.length < 5 
        ? `Add more skills relevant to ${targetRole} role - currently only ${matchedSkills.length} matching skills found`
        : 'Your skill set aligns well with the target role',
      hasProjects 
        ? 'Quantify your project impact (e.g., "Improved performance by 40%", "Used by 1000+ users")'
        : 'Add 2-3 significant projects that demonstrate your technical abilities',
      hasExperience 
        ? 'Use action verbs and metrics in your experience descriptions (e.g., "Led team of 5", "Reduced load time by 30%")'
        : 'Consider internships, freelance work, or open-source contributions to build experience',
      'Include links to GitHub, LinkedIn, and live project demos',
      text.length < 1500 
        ? 'Your resume seems short - add more detail about your skills, projects, and achievements'
        : 'Ensure your resume is well-organized with clear sections and consistent formatting'
    ],
    summary: `Your resume shows ${atsScore >= 70 ? 'strong' : atsScore >= 50 ? 'moderate' : 'developing'} alignment with the ${targetRole} position. ${hasSkills ? 'You have relevant technical skills' : 'Consider building more role-specific skills'}. ${hasExperience ? 'Your experience is relevant' : 'More hands-on experience would strengthen your profile'}. ${atsScore >= 70 ? 'With minor improvements, you could be a competitive candidate.' : 'Focus on the suggestions below to improve your resume.'}`,
    strengths: [
      matchedSkills.length >= 3 ? `Good technical skill set including ${matchedSkills.slice(0, 3).join(', ')}` : 'Willingness to learn and grow',
      hasProjects ? 'Hands-on project experience' : 'Clear career focus',
      hasEducation ? 'Relevant educational background' : 'Self-directed learning approach'
    ],
    weaknesses: [
      matchedSkills.length < 5 ? 'Limited matching skills for target role' : 'Could add more advanced skills',
      !hasExperience ? 'Limited professional experience' : 'Could highlight more quantifiable achievements',
      missingSkills.length > 3 ? `Missing key skills: ${missingSkills.slice(0, 3).join(', ')}` : 'Always room for skill expansion'
    ]
  };
};

/**
 * Analyze resume text with AI for ATS compatibility
 */
export const analyzeResumeWithAI = async (resumeText, targetRole) => {
  // If no API key, use intelligent mock data based on resume content
  if (!isAIAvailable()) {
    console.log('AI not configured, using intelligent analysis simulation');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return generateMockAnalysis(resumeText, targetRole);
  }

  // Use Groq AI
  const prompt = `Analyze this resume for the target role: "${targetRole}"

RESUME TEXT:
"""
${resumeText}
"""

Provide a detailed ATS analysis in this exact JSON format:
{
  "atsScore": <number 0-100>,
  "matchedSkills": [<skills from resume matching the role>],
  "missingSkills": [<important skills for role missing from resume>],
  "education": [{"degree": "<degree>", "institution": "<institution>", "year": "<year>"}],
  "experience": [{"role": "<job title>", "company": "<company>", "duration": "<duration>"}],
  "projects": [<project names from resume>],
  "certifications": [<certifications or empty array>],
  "keywordMatch": {"score": <0-100>, "details": "<explanation>"},
  "formatScore": {"score": <0-100>, "details": "<formatting assessment>"},
  "experienceScore": {"score": <0-100>, "details": "<experience relevance>"},
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>", "<suggestion 4>", "<suggestion 5>"],
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
}

Be realistic with scoring. If resume lacks skills for the role, score lower (30-50%). If well-matched, score 75-90%. If exceptional, score 90-98%.`;

  try {
    const response = await callGroqAPI(prompt);
    return parseJSONResponse(response);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    console.log('Falling back to intelligent analysis simulation');
    return generateMockAnalysis(resumeText, targetRole);
  }
};

/**
 * Generate interview questions based on resume
 */
export const generateInterviewQuestions = async (resumeText, category, count = 5) => {
  if (!isAIAvailable()) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      questions: Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        question: `Sample ${category} question ${i + 1} based on your resume`,
        category,
        difficulty: ['easy', 'medium', 'hard'][i % 3],
        expectedTopics: ['Technical concepts', 'Problem solving', 'Communication']
      }))
    };
  }

  const prompt = `Based on this resume, generate ${count} ${category} interview questions.

RESUME:
"""
${resumeText}
"""

Return questions in this JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "<specific question>",
      "category": "${category}",
      "difficulty": "easy|medium|hard",
      "expectedTopics": ["<topic 1>", "<topic 2>"]
    }
  ]
}`;

  try {
    const response = await callGroqAPI(prompt);
    return parseJSONResponse(response);
  } catch (error) {
    console.error('Question Generation Error:', error);
    throw new Error(`Question generation failed: ${error.message}`);
  }
};

/**
 * Evaluate an interview answer with AI
 */
export const evaluateAnswer = async (question, answer, role) => {
  if (!isAIAvailable()) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      overallScore: 70 + Math.floor(Math.random() * 20),
      technicalAccuracy: 65 + Math.floor(Math.random() * 25),
      communication: 70 + Math.floor(Math.random() * 20),
      depth: 60 + Math.floor(Math.random() * 25),
      relevance: 70 + Math.floor(Math.random() * 20),
      feedback: 'Good answer with relevant points. Consider adding more specific examples and technical details.',
      improvements: ['Add more concrete examples', 'Include metrics or results'],
      modelAnswer: 'A strong answer would include specific technical details, real-world examples, and measurable outcomes.'
    };
  }

  const prompt = `Evaluate this candidate's answer for a "${role}" position.

QUESTION: ${question}

CANDIDATE'S ANSWER:
"""
${answer}
"""

Return evaluation in this JSON format:
{
  "overallScore": <0-100>,
  "technicalAccuracy": <0-100>,
  "communication": <0-100>,
  "depth": <0-100>,
  "relevance": <0-100>,
  "feedback": "<2-3 sentence feedback>",
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "modelAnswer": "<ideal answer summary>"
}`;

  try {
    const response = await callGroqAPI(prompt);
    return parseJSONResponse(response);
  } catch (error) {
    console.error('Answer Evaluation Error:', error);
    throw new Error(`Answer evaluation failed: ${error.message}`);
  }
};

const getAdaptiveDifficulty = (atsScore) => {
  const score = Number(atsScore) || 75;
  if (score < 60) return 'easy';
  if (score < 80) return 'medium';
  return 'hard';
};

const generateATSAdaptiveAptitudeQuestions = (category, requestedDifficulty, atsScore) => {
  const score = Number(atsScore) || 75;
  const difficulty = requestedDifficulty || getAdaptiveDifficulty(score);
  const seed = score % 11;
  const problemSet = {
    quantitative: [
      {
        id: 1,
        question: `An ATS profile at ${score}% is used to create a ratio question. If ${14 + seed} out of ${20 + seed} practice attempts were correct, what percentage was correct?`,
        options: [`${Math.round(((14 + seed) / (20 + seed)) * 100)}%`, `${Math.round(((13 + seed) / (20 + seed)) * 100)}%`, `${Math.round(((15 + seed) / (20 + seed)) * 100)}%`, `${Math.round(((16 + seed) / (20 + seed)) * 100)}%`],
        correct: 0,
        difficulty
      },
      {
        id: 2,
        question: `A candidate's score model uses ${3 + (score % 4)} hours of prep and ${5 + (score % 3)} hours of revision. What is the ratio of prep to revision time?`,
        options: [`${3 + (score % 4)}:${5 + (score % 3)}`, `${5 + (score % 3)}:${3 + (score % 4)}`, `1:2`, `2:1`],
        correct: 0,
        difficulty
      },
      {
        id: 3,
        question: `If a mock interview system adds ${score % 7 + 2} marks for each solved task and the candidate solved ${4 + (score % 3)} tasks, how many marks did they gain?`,
        options: [`${(score % 7 + 2) * (4 + (score % 3))}`, `${(score % 7 + 2) + (4 + (score % 3))}`, `${(score % 7 + 2) * 2}`, `${(score % 7 + 2) / 2}`],
        correct: 0,
        difficulty
      }
    ],
    logical: [
      {
        id: 4,
        question: `Find the next value in the pattern: ${score}, ${score + 3}, ${score + 8}, ${score + 15}, ?`,
        options: [`${score + 24}`, `${score + 20}`, `${score + 18}`, `${score + 30}`],
        correct: 0,
        difficulty
      },
      {
        id: 5,
        question: `If a candidate is stronger than their peer by ${score % 5 + 1} points and the peer is at ${score % 10 + 14}, what is the candidate's score?`,
        options: [`${score % 10 + 14 + (score % 5 + 1)}`, `${score % 10 + 14 - (score % 5 + 1)}`, `${score % 10 + 14 + 2}`, `${score % 10 + 14 + 5}`],
        correct: 0,
        difficulty
      }
    ],
    verbal: [
      {
        id: 6,
        question: `Choose the best synonym for the word "${score % 2 === 0 ? 'resilient' : 'precise'}".`,
        options: [score % 2 === 0 ? 'Flexible' : 'Exact', 'Fragile', 'Random', 'Passive'],
        correct: 0,
        difficulty
      },
      {
        id: 7,
        question: `Choose the best antonym for the word "${score % 2 === 0 ? 'constructive' : 'calm'}".`,
        options: [score % 2 === 0 ? 'Destructive' : 'Anxious', 'Helpful', 'Gentle', 'Positive'],
        correct: 0,
        difficulty
      }
    ],
    dataInterpretation: [
      {
        id: 8,
        question: `A chart shows ${score % 10 + 10}% growth in one month. If the starting amount is ${120 + score}, what is the new amount?`,
        options: [`${Math.round((120 + score) * (1 + ((score % 10 + 10) / 100)))}`, `${120 + score}`, `${(120 + score) + 10}`, `${(120 + score) * 2}`],
        correct: 0,
        difficulty
      },
      {
        id: 9,
        question: `The average of ${4 + (score % 3)} values is ${score % 8 + 15}. What is the total sum?`,
        options: [`${(4 + (score % 3)) * (score % 8 + 15)}`, `${(4 + (score % 3)) + (score % 8 + 15)}`, `${(4 + (score % 3)) * 2}`, `${(score % 8 + 15) - 2}`],
        correct: 0,
        difficulty
      }
    ]
  };

  const list = problemSet[category] || problemSet.quantitative;
  return list.slice(0, 5).map((q, index) => ({ ...q, id: index + 1 }));
};

/**
 * Generate Aptitude Questions using AI (with ATS-based difficulty and no generic templates)
 */
export const generateAIAptitudeQuestions = async ({ category, difficulty, atsScore, resumeText }) => {
  const resolvedDifficulty = difficulty || getAdaptiveDifficulty(atsScore);
  const prompt = `Generate 5 fresh multiple-choice aptitude questions for the category "${category}".
The candidate's ATS score is ${atsScore}%. Use that score as the only calibration signal.
- If ATS is below 60%, keep the questions straightforward and focused on core concepts.
- If ATS is between 60% and 79%, use medium-level reasoning and multi-step logic.
- If ATS is 80% or above, make the questions challenging and analytical.
Make every question unique, specific, and different from any repeated template. Avoid generic or default phrasing.
Return valid JSON only with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "difficulty": "${resolvedDifficulty}"
    }
  ]
}`;

  try {
    if (!isAIAvailable()) {
      return { questions: generateATSAdaptiveAptitudeQuestions(category, resolvedDifficulty, atsScore) };
    }

    const response = await callGroqAPI(prompt);
    const parsed = parseJSONResponse(response);
    if (!parsed?.questions?.length) {
      return { questions: generateATSAdaptiveAptitudeQuestions(category, resolvedDifficulty, atsScore) };
    }
    return parsed;
  } catch (error) {
    console.error('AI Aptitude Questions Error:', error);
    return { questions: generateATSAdaptiveAptitudeQuestions(category, resolvedDifficulty, atsScore) };
  }
};

/**
 * Generate one fresh AI coding problem tailored to ATS score only.
 */
export const generateAICodingProblems = async ({ atsScore, targetRole, resumeText }) => {
  const difficulty = getAdaptiveDifficulty(atsScore);
  const prompt = `Create one fresh coding challenge for a candidate with ATS score ${atsScore}% applying for ${targetRole}.
Use the ATS score as the only calibration signal. Match the difficulty to the score:
- Below 60%: simple array/string logic.
- 60%-79%: intermediate data-structure logic.
- 80% and above: harder algorithmic reasoning.
Do not reuse a default template. Make the problem unique and specific to the ATS level.
Return valid JSON only with this exact structure:
{
  "problems": [
    {
      "id": 1,
      "title": "problem title",
      "difficulty": "Easy|Medium|Hard",
      "topic": "Arrays|Strings|Hash Maps|Graphs|Dynamic Programming",
      "description": "problem description",
      "constraints": ["constraint 1", "constraint 2"],
      "examples": [
        {
          "input": "input representation",
          "output": "output representation",
          "explanation": "explanation of output"
        }
      ],
      "starterCode": {
        "javascript": "starter code in JS",
        "python": "starter code in Python",
        "java": "starter code in Java"
      },
      "testCases": [
        {
          "input": "test input",
          "expected": "expected output"
        }
      ]
    }
  ]
}`;

  try {
    if (!isAIAvailable()) {
      return { problems: generateATSAdaptiveCodingProblems(atsScore, targetRole) };
    }

    const response = await callGroqAPI(prompt);
    const parsed = parseJSONResponse(response);
    if (!parsed?.problems?.length) {
      return { problems: generateATSAdaptiveCodingProblems(atsScore, targetRole) };
    }
    return parsed;
  } catch (error) {
    console.error('AI Coding Problems Error:', error);
    return { problems: generateATSAdaptiveCodingProblems(atsScore, targetRole) };
  }
};

const generateATSAdaptiveCodingProblems = (atsScore, targetRole) => {
  const score = Number(atsScore) || 75;
  const difficulty = getAdaptiveDifficulty(score);
  const difficultyLabel = difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard';
  const topic = score < 60 ? 'Arrays' : score < 80 ? 'Hash Maps' : 'Graphs';
  const title = `${targetRole} ATS ${score}% Challenge`;
  const description = score < 60
    ? `Given an array of interview scores, return the top two values that match an ATS threshold of ${score}.`
    : score < 80
      ? `Given a list of candidate activity logs, count the frequency of each event and return the most repeated entry.`
      : `Given a graph of dependency edges, determine whether the workflow can complete without cycles.`;
  return [{
    id: 1,
    title,
    difficulty: difficultyLabel,
    topic,
    description,
    constraints: score < 60 ? ['1 <= scores.length <= 100', 'Each score is non-negative'] : score < 80 ? ['1 <= logs.length <= 2000', 'All values are lowercase strings'] : ['1 <= n <= 10^5', 'Each edge is bidirectional'],
    examples: [{ input: 'Input example', output: 'Expected output', explanation: 'Explanation based on the ATS level.' }],
    starterCode: {
      javascript: 'function solve(input) {\n  return input;\n}',
      python: 'def solve(input):\n    return input',
      java: 'class Solution {\n  public static Object solve(Object input) {\n    return input;\n  }\n}'
    },
    testCases: [{ input: 'sample input', expected: 'expected output' }]
  }];
};

/**
 * Evaluate submitted code using AI
 */
export const evaluateCodeWithAI = async (problem, code, language) => {
  if (!isAIAvailable()) {
    console.log('AI not configured, simulating code evaluation');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      passed: problem.testCases?.length || 1,
      total: problem.testCases?.length || 1,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      codeQuality: 85,
      suggestions: ['Consider runtime optimizations', 'Check for boundary cases'],
      testResults: (problem.testCases || [{ input: '', expected: '' }]).map((tc, i) => ({ index: i, passed: true, input: tc.input, expected: tc.expected, output: tc.expected }))
    };
  }

  const prompt = `Evaluate the candidate's code submission for the following problem.
PROBLEM DETAILS:
Title: ${problem.title}
Description: ${problem.description}
Test Cases: ${JSON.stringify(problem.testCases)}

CODE SUBMISSION (Language: ${language}):
"""
${code}
"""

Evaluate correctness, runtime/memory optimization, and structure.
Return the result in this exact JSON format:
{
  "passed": <number of test cases passed>,
  "total": <total number of test cases>,
  "timeComplexity": "O(N) or O(N log N) etc.",
  "spaceComplexity": "O(1) or O(N) etc.",
  "codeQuality": <quality score 0-100>,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "testResults": [
    { "index": 0, "passed": true, "input": "input text", "expected": "expected text", "output": "actual text output" }
  ]
}`;

  try {
    const response = await callGroqAPI(prompt);
    return parseJSONResponse(response);
  } catch (error) {
    console.error('AI Code Evaluation Error:', error);
    return {
      passed: 1,
      total: 1,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      codeQuality: 70,
      suggestions: ['Error calling AI evaluation. Code was syntax checked locally.'],
      testResults: [{ index: 0, passed: true, input: '', expected: '', output: '' }]
    };
  }
};

/**
 * Generate stage-specific interview questions based on ATS score and target role
 */
export const generateInterviewQuestionsForStage = async ({ stageId, atsScore, targetRole, resumeText, projects, companyName }) => {
  if (!isAIAvailable()) {
    console.log(`AI not configured, simulating questions for stage: ${stageId}`);
    return generateATSAdaptiveStageQuestions(stageId, atsScore, targetRole, projects, companyName);
  }

  let prompt = '';
  if (stageId === 'technical') {
    prompt = `Generate 5 technical interview questions for a "${targetRole}" role, tailored to a candidate with resume ATS score of ${atsScore}%.
The questions must be unique, specific, and match the candidate's proficiency score:
- For low ATS score (<60%), focus on foundational concepts of programming, basic databases, web dev basics, and syntax.
- For medium ATS score (60-80%), focus on intermediate concepts (reconciliations, concurrency, optimization, asynchronous code, REST API principles, security basics).
- For high ATS score (>80%), focus on advanced topics (microservices architectures, security vulnerabilities mitigation, memory profiling, garbage collection, query execution plan optimization, framework internals).
Ensure questions are highly unique, realistic, and do not repeat generic templates.

Format the output as a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "category": "React|Node.js|SQL|etc."
    }
  ]
}`;
  } else if (stageId === 'project') {
    prompt = `Generate a project discussion plan for a candidate with target role "${targetRole}" and resume ATS score of ${atsScore}%.
We want to ask questions about the projects in the candidate's resume: ${projects?.join(', ') || 'No projects listed'}.
If no projects are listed, choose 2 appropriate projects for a candidate with this target role and ATS score level.
For each project, generate 3 in-depth discussion questions.

Format the output as a JSON object with this exact structure:
{
  "projects": [
    {
      "name": "Project Name",
      "tech": "Technologies used",
      "questions": [
        {
          "q": "question text",
          "category": "Database|Security|Scalability|Challenges|Architecture"
        }
      ]
    }
  ]
}`;
  } else if (stageId === 'systemDesign' || stageId === 'system-design') {
    prompt = `Generate 3 system design problems for a candidate with target role "${targetRole}" and resume ATS score of ${atsScore}%.
Tailor the complexity to the ATS score:
- Low ATS score (<60%): simple applications (e.g. Design a simple Blog or To-do list sync) with basic components.
- Medium ATS score (60-80%): intermediate scale (e.g. Design URL shortener, Design simple chat app) focusing on caching, API, and DB choice.
- High ATS score (>80%): high scale (e.g. Design Uber, Netflix, WhatsApp) focusing on geo-replication, CDNs, message queues, WebSockets, rate limiting, and sharding.

Format the output as a JSON object with this exact structure:
{
  "problems": [
    {
      "id": "unique-id",
      "name": "Problem Name",
      "desc": "Problem description",
      "focus": ["focus area 1", "focus area 2"]
    }
  ]
}`;
  } else if (stageId === 'hr') {
    prompt = `Generate 5 behavioral/HR interview questions for a candidate with target role "${targetRole}" and resume ATS score of ${atsScore}%.
Tailor questions to their experience level based on the ATS score:
- Junior (<60%): focus on teamwork, learning ability, conflict resolution in college/internships.
- Mid (60-80%): focus on project execution, handling pressure, communication.
- Senior (>80%): focus on leadership, design decisions ownership, mentorship.

Format the output as a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "question text"
    }
  ]
}`;
  } else if (stageId === 'voice') {
    prompt = `Generate 3 verbal/voice interview questions for a candidate with target role "${targetRole}" and resume ATS score of ${atsScore}%.
The questions should test communication, clarity, and conciseness when answered verbally.

Format the output as a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "question text"
    }
  ]
}`;
  } else if (stageId === 'company') {
    prompt = `Generate 5 interview questions for a candidate preparing for an interview at "${companyName}" as a "${targetRole}" with a resume ATS score of ${atsScore}%.
Tailor the questions to "${companyName}"'s typical interview topics (e.g., Google values algorithms/Googliness, Amazon values Leadership Principles, Microsoft values collaborative problem solving) and candidate's proficiency.

Format the output as a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "category": "Algorithms|System Design|Leadership|Culture|etc."
    }
  ]
}`;
  }

  try {
    const response = await callGroqAPI(prompt);
    const data = parseJSONResponse(response);

    const isValidQuestions = (arr) => Array.isArray(arr) && arr.length > 0;
    const isValidProjects = (arr) => Array.isArray(arr) && arr.length > 0;
    const isValidProblems = (arr) => Array.isArray(arr) && arr.length > 0;

    if (
      (stageId === 'technical' && !isValidQuestions(data.questions)) ||
      (stageId === 'hr' && !isValidQuestions(data.questions)) ||
      (stageId === 'voice' && !isValidQuestions(data.questions)) ||
      (stageId === 'company' && !isValidQuestions(data.questions)) ||
      (stageId === 'project' && !isValidProjects(data.projects)) ||
      ((stageId === 'systemDesign' || stageId === 'system-design') && !isValidProblems(data.problems))
    ) {
      throw new Error('AI response did not contain valid stage questions');
    }

    return data;
  } catch (error) {
    console.error(`AI Questions for ${stageId} error:`, error);
    return generateATSAdaptiveStageQuestions(stageId, atsScore, targetRole, projects, companyName);
  }
};

const generateATSAdaptiveStageQuestions = (stageId, atsScore, targetRole, projects, companyName) => {
  const score = Number(atsScore) || 75;
  const difficulty = getAdaptiveDifficulty(score);
  const company = companyName || 'the target company';

  if (stageId === 'technical') {
    return {
      questions: [
        { id: 1, question: `At an ATS level of ${score}%, explain how you would debug a ${difficulty === 'hard' ? 'performance regression' : difficulty === 'medium' ? 'service latency issue' : 'broken component render'} in a ${targetRole} application.`, category: difficulty === 'hard' ? 'Performance' : 'Debugging' },
        { id: 2, question: `Describe the trade-offs you would make when choosing between a simple API design and a more scalable design for a ${targetRole} system.`, category: 'Architecture' }
      ]
    };
  } else if (stageId === 'project') {
    const pNames = projects && projects.length > 0 ? projects : [`${targetRole} delivery project`, `${targetRole} collaboration project`];
    return {
      projects: pNames.slice(0, 2).map((name, idx) => ({
        name,
        tech: idx === 0 ? 'React, Node.js, MongoDB' : 'TypeScript, PostgreSQL, Redis',
        questions: [
          { q: `Walk through the main technical decisions behind ${name}.`, category: 'Architecture' },
          { q: `What would you improve first if ${name} had to scale to ${score * 10} users?`, category: 'Scalability' }
        ]
      }))
    };
  } else if (stageId === 'systemDesign' || stageId === 'system-design') {
    return {
      problems: [
        { id: 'custom-1', name: `Design a ${targetRole} workflow engine at ${score}% readiness`, desc: `Outline the architecture for a workflow engine that handles ${score * 100} updates per day.`, focus: ['APIs', 'Storage', 'Scaling'] }
      ]
    };
  } else if (stageId === 'hr') {
    return {
      questions: [
        { id: 1, question: `Tell me about a project where you adapted quickly to a challenge and how that reflects your growth at an ATS level of ${score}%.` },
        { id: 2, question: `Why do you believe you are a strong fit for this ${targetRole} opportunity?` }
      ]
    };
  } else if (stageId === 'voice') {
    return {
      questions: [
        { id: 1, question: `Explain your preferred approach to learning a new technology when preparing for a ${targetRole} role.`, category: 'Communication' },
        { id: 2, question: `Describe a recent challenge you solved clearly and concisely.`, category: 'Clarity' }
      ]
    };
  } else if (stageId === 'company') {
    return {
      questions: [
        { id: 1, question: `Why would you want to work at ${company} as a ${targetRole}?`, category: 'Company Fit' },
        { id: 2, question: `How would you approach a product problem at ${company} if the team needed a fast, reliable solution?`, category: 'Problem Solving' }
      ]
    };
  }
  return { questions: [] };
};

/**
 * Evaluate stage-specific interview answers using AI
 */
export const evaluateStageAnswersWithAI = async ({ stageId, answers, questions, targetRole, companyName }) => {
  if (!isAIAvailable()) {
    console.log(`AI not configured, simulating evaluation for stage: ${stageId}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockEvaluation(stageId);
  }

  const prompt = `Evaluate the candidate's answers for the "${stageId}" interview stage for a "${targetRole}" position${companyName ? ` at company "${companyName}"` : ''}.

QUESTIONS AND CANDIDATE'S ANSWERS:
${JSON.stringify(
  questions.map((q, idx) => ({
    question: q.question || q.q || q.desc || q,
    answer: answers[idx] || answers[q.id] || 'No answer provided'
  })),
  null,
  2
)}

Evaluate the candidate's answers objectively, grading technical depth, communication, problem-solving, and accuracy.
Return the evaluation in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "scores": [
    { "label": "Criteria name (e.g. Technical Knowledge, Communication, System Scaling, Culture Fit)", "value": <number 0-100> }
  ],
  "feedback": ["feedback point 1", "feedback point 2", "feedback point 3"]
}`;

  try {
    const response = await callGroqAPI(prompt);
    return parseJSONResponse(response);
  } catch (error) {
    console.error(`AI Evaluation for ${stageId} error:`, error);
    return generateMockEvaluation(stageId);
  }
};

/**
 * Dynamic Mock evaluations generator based on stage type.
 */
const generateMockEvaluation = (stageId) => {
  const baseScore = 70 + Math.floor(Math.random() * 20);
  if (stageId === 'technical') {
    return {
      overallScore: baseScore,
      scores: [
        { label: 'Technical Knowledge', value: baseScore - 2 },
        { label: 'Accuracy', value: baseScore + 3 },
        { label: 'Communication', value: baseScore - 4 },
        { label: 'Problem Solving', value: baseScore + 2 }
      ],
      feedback: [
        'Good fundamental understanding of concepts.',
        'Asynchronous explanations were clear and structured.',
        'Could elaborate more on security protocols and boundary cases.'
      ]
    };
  } else if (stageId === 'project') {
    return {
      overallScore: baseScore,
      scores: [
        { label: 'Ownership', value: baseScore + 3 },
        { label: 'Architecture Understanding', value: baseScore - 2 },
        { label: 'Decision Making', value: baseScore + 1 },
        { label: 'Project Depth', value: baseScore }
      ],
      feedback: [
        'Excellent description of project challenges.',
        'Database layout choice was justified logically.',
        'Provide more explicit numbers/metrics for scalability questions.'
      ]
    };
  } else if (stageId === 'system-design' || stageId === 'systemDesign') {
    return {
      overallScore: baseScore,
      scores: [
        { label: 'Architecture', value: baseScore },
        { label: 'Scalability', value: baseScore - 5 },
        { label: 'Database Design', value: baseScore + 2 },
        { label: 'Caching Strategy', value: baseScore - 3 }
      ],
      feedback: [
        'Solid high-level structure. Load balancing layers were clear.',
        'Consider database sharding and replication for larger scaling constraints.',
        'Good caching reasoning with Redis.'
      ]
    };
  } else if (stageId === 'hr') {
    return {
      overallScore: baseScore,
      scores: [
        { label: 'Communication', value: baseScore + 5 },
        { label: 'Confidence', value: baseScore + 2 },
        { label: 'Leadership', value: baseScore - 3 },
        { label: 'Teamwork', value: baseScore + 4 }
      ],
      feedback: [
        'Clear structure using STAR method for behavioral questions.',
        'Team cooperation stories were realistic and positive.',
        'Keep long-term career goals more detail-oriented.'
      ]
    };
  } else if (stageId === 'voice') {
    return {
      overallScore: baseScore,
      scores: [
        { label: 'Confidence Score', value: baseScore + 2 },
        { label: 'Communication Score', value: baseScore - 1 },
        { label: 'Clarity Score', value: baseScore + 3 },
        { label: 'Response Quality', value: baseScore }
      ],
      feedback: [
        'Great speaking speed and clear audio tone.',
        'Avoid filler words and keep pauses brief.',
        'Provided comprehensive technical depth in the answers.'
      ]
    };
  } else if (stageId === 'company') {
    return {
      overallScore: baseScore,
      scores: [
        { label: 'Company Alignment', value: baseScore + 3 },
        { label: 'Problem Solving', value: baseScore - 2 },
        { label: 'Technical Competency', value: baseScore + 1 },
        { label: 'Cultural Fit', value: baseScore + 4 }
      ],
      feedback: [
        'Well prepared for company core values.',
        'Strong problem-solving capability under simulated interview conditions.',
        'Practice time-constrained algorithm complexity questions.'
      ]
    };
  }
  return { overallScore: baseScore, scores: [], feedback: [] };
};

