export type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export type PurchasePayload = {
  name: string;
  email: string;
  phone: string;
  planId: "basic" | "premium";
  amount: number; // in INR rupees
};