const SUPABASE_URL = "https://ghiuxjeafbazwtklyoze.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_H9JModzLitS3PW9xFpDMyA_O3mj4OvQ";

const questions = [
  "When did we first meet?",
  "Where did we meet for the first time?",
  "What was your first impression of me?",
  "What is our funniest memory together?",
  "Which song reminds you of our friendship?",
  "What nickname do you have for me?",
  "What is something I always say or do?",
  "What is the most random thing we bonded over?",
  "If we could plan a trip right now, where would we go?",
  "Describe our friendship in one word.",
];

const quizForm = document.getElementById("quizForm");
const questionsWrap = document.getElementById("questions");
const result = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");
const friendName = document.getElementById("friendName");
const submitBtn = quizForm.querySelector("button[type='submit']");

const renderQuestions = () => {
  questionsWrap.innerHTML = "";

  questions.forEach((question, index) => {
    const questionBlock = document.createElement("div");
    questionBlock.className = "question";

    const label = document.createElement("label");
    const fieldId = `q${index + 1}`;
    label.setAttribute("for", fieldId);
    label.textContent = `${index + 1}. ${question}`;

    const textarea = document.createElement("textarea");
    textarea.id = fieldId;
    textarea.name = fieldId;
    textarea.placeholder = "Type your answer...";

    questionBlock.append(label, textarea);
    questionsWrap.append(questionBlock);
  });
};

const collectAnswers = () => {
  const answers = [];
  questions.forEach((_, index) => {
    const field = document.getElementById(`q${index + 1}`);
    answers.push(field.value.trim());
  });
  return answers;
};

const getAnsweredCount = (answers) =>
  answers.filter((answer) => answer.length > 0).length;

const setResult = (html, variant = "info") => {
  result.classList.remove("hidden");
  result.classList.remove("success", "error");
  if (variant === "success") result.classList.add("success");
  if (variant === "error") result.classList.add("error");
  result.innerHTML = html;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
};

const buildPayload = (answers) => ({
  name: friendName.value.trim(),
  answers,
  answeredCount: getAnsweredCount(answers),
  questions,
  submittedAt: new Date().toISOString(),
});

const getSupabaseClient = () => {
  if (
    !SUPABASE_URL ||
    SUPABASE_URL.includes("PASTE_YOUR") ||
    !SUPABASE_ANON_KEY ||
    SUPABASE_ANON_KEY.includes("PASTE_YOUR")
  ) {
    throw new Error("Missing Supabase configuration.");
  }

  if (!window.supabase) {
    throw new Error("Supabase client not loaded.");
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

const submitResponse = async (payload) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("responses").insert([
    {
      name: payload.name || null,
      answers: payload.answers,
      answered_count: payload.answeredCount,
      questions: payload.questions,
      submitted_at: payload.submittedAt,
    },
  ]);

  if (error) {
    throw new Error(error.message || "Submission failed.");
  }
};

const resetQuiz = () => {
  quizForm.reset();
  result.classList.add("hidden");
  result.classList.remove("success", "error");
  result.innerHTML = "";
};

quizForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const answers = collectAnswers();
  const answeredCount = getAnsweredCount(answers);
  const payload = buildPayload(answers);

  setResult(
    `
      <h2>Submitting your answers...</h2>
      <p>Please wait a moment.</p>
    `,
    "info"
  );

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    await submitResponse(payload);
    setResult(
      `
        <h2>Thanks for playing!</h2>
        <p>You answered ${answeredCount} out of ${questions.length} questions.</p>
        <p>Your answers were saved successfully.</p>
      `,
      "success"
    );
  } catch (error) {
    setResult(
      `
        <h2>We couldn't submit your answers.</h2>
        <p>Please try again, or share your answers directly with your friend.</p>
      `,
      "error"
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Finish Quiz";
  }
});

resetBtn.addEventListener("click", resetQuiz);

renderQuestions();
