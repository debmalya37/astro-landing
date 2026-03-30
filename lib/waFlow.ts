export type Step = "START" | "MAIN_MENU" | "CAREER_MENU" | "END";
export type FlowState = { step: Step };

const PAYMENT_LINK_BASIC = "https://rzp.io/l/your_basic_link";
const PAYMENT_LINK_PREMIUM = "https://rzp.io/l/your_premium_link";

export function nextMessage(input: string, state: FlowState): { reply: string; newState: FlowState } {
  const msg = input.trim().toLowerCase();

  if (state.step === "START") {
    return {
      reply:
        "Welcome to Astrologar ✨\nReply:\n1) Career Report\n2) Marriage Report\n3) Health Report",
      newState: { step: "MAIN_MENU" },
    };
  }

  if (state.step === "MAIN_MENU") {
    if (msg === "1" || msg === "2" || msg === "3") {
      return {
        reply:
          "Great choice.\nSelect plan:\n1) Basic ₹499\n2) Premium ₹999\nReply with 1 or 2.",
        newState: { step: "CAREER_MENU" },
      };
    }
    return {
      reply: "Please reply with 1, 2, or 3.",
      newState: state,
    };
  }

  if (state.step === "CAREER_MENU") {
    if (msg === "1") {
      return {
        reply: `Pay here (Basic): ${PAYMENT_LINK_BASIC}\nAfter payment, send 'done'.`,
        newState: { step: "END" },
      };
    }
    if (msg === "2") {
      return {
        reply: `Pay here (Premium): ${PAYMENT_LINK_PREMIUM}\nAfter payment, send 'done'.`,
        newState: { step: "END" },
      };
    }
    return { reply: "Reply 1 for Basic or 2 for Premium.", newState: state };
  }

  return {
    reply:
      "Thanks! Need more services?\nReply:\n1) Gemstone Recommendation\n2) Kundli Matching\n3) Talk to Expert",
    newState: { step: "END" },
  };
}