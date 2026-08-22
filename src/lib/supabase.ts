// Supabase client helper with offline fallback storage for hackathon demos

export interface OffChainEvidence {
  id: string;
  expenseId: number;
  fileName: string;
  fileUrl: string;
  invoiceNumber: string;
  supplierName: string;
  notes: string;
  uploadedAt: string;
}

// Local cache for demo evidence attachments
const LOCAL_EVIDENCE_KEY = "tracedonate_offchain_evidence";

export const getEvidenceForExpense = (expenseId: number): OffChainEvidence | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_EVIDENCE_KEY);
    if (!raw) return null;
    const items: Record<number, OffChainEvidence> = JSON.parse(raw);
    return items[expenseId] || null;
  } catch {
    return null;
  }
};

export const saveEvidenceForExpense = (expenseId: number, evidence: Omit<OffChainEvidence, "id" | "uploadedAt">): OffChainEvidence => {
  const newRecord: OffChainEvidence = {
    ...evidence,
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    uploadedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_EVIDENCE_KEY);
      const items: Record<number, OffChainEvidence> = raw ? JSON.parse(raw) : {};
      items[expenseId] = newRecord;
      localStorage.setItem(LOCAL_EVIDENCE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Local storage write error:", e);
    }
  }

  return newRecord;
};
