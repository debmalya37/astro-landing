const FAQS = [
  {
    q: "What is included in the astrology report?",
    a: "Your report includes birth chart analysis, personality insights, career guidance, relationship compatibility, and upcoming transit highlights.",
  },
  {
    q: "How long does report delivery take?",
    a: "Most reports are delivered within 24-48 hours after successful payment.",
  },
  {
    q: "Is my birth data secure?",
    a: "Yes. We use secure storage and only use your details for report generation and communication.",
  },
  {
    q: "Can I ask follow-up questions?",
    a: "Yes, premium plan includes one follow-up clarification session.",
  },
  {
    q: "Do you offer refunds?",
    a: "Because reports are personalized digital services, refunds are generally not available after processing starts.",
  },
];

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// simple lexical similarity starter (replace with embeddings later)
function score(query: string, candidate: string) {
  const q = new Set(tokenize(query));
  const c = new Set(tokenize(candidate));
  let common = 0;
  q.forEach((t) => {
    if (c.has(t)) common++;
  });
  return common / (q.size + 1);
}

export function answerFromFaq(userQuery: string) {
  let best = { idx: -1, s: 0 };
  FAQS.forEach((f, idx) => {
    const s = Math.max(score(userQuery, f.q), score(userQuery, f.a) * 0.7);
    if (s > best.s) best = { idx, s };
  });

  if (best.idx === -1 || best.s < 0.15) {
    return "I’m not fully sure about that yet. Please share your question and contact details, and our astrologer team will assist you shortly.";
  }
  return FAQS[best.idx].a;
}