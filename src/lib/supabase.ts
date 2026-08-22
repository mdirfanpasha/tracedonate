// Supabase & Local Evidence Storage Helper for Receipts & Invoices

export interface OffChainEvidence {
  id: string;
  expenseId: number;
  fileName: string;
  fileUrl: string;
  invoiceNumber: string;
  supplierName: string;
  notes: string;
  uploadedAt: string;
  imageData?: string; // base64 receipt photo
}

const LOCAL_EVIDENCE_KEY = "tracedonate_offchain_evidence";

// Default authentic sample receipts for demo inspection
const DEFAULT_RECEIPTS: Record<number, OffChainEvidence> = {
  1: {
    id: "ev-1",
    expenseId: 1,
    fileName: "Emergency_Food_Rations_Invoice_INV-8492.jpg",
    fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80",
    invoiceNumber: "INV-8492",
    supplierName: "Apex Humanitarian Food Supplies Ltd.",
    notes: "5,000 grain packages and high-calorie nutritional paste for flood-displaced families.",
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    imageData: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80",
  },
  2: {
    id: "ev-2",
    expenseId: 2,
    fileName: "Emergency_Trauma_Medical_Kits_Receipt_INV-9104.jpg",
    fileUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80",
    invoiceNumber: "INV-9104",
    supplierName: "Global BioMed Logistics Vendor",
    notes: "200 First-responder trauma kits, sterile bandages, and waterborne illness antibiotic courses.",
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    imageData: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80",
  },
  3: {
    id: "ev-3",
    expenseId: 3,
    fileName: "Flood_Relief_Transport_Fuel_Receipt_INV-3201.jpg",
    fileUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80",
    invoiceNumber: "INV-3201",
    supplierName: "Riverine Rescue Boat Fleet",
    notes: "4 Heavy diesel boats deployed for 48-hour rescue and transport operations across 3 inundated sectors.",
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    imageData: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80",
  },
  4: {
    id: "ev-4",
    expenseId: 4,
    fileName: "Solar_Pumps_Inverters_Invoice_INV-1092.jpg",
    fileUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80",
    invoiceNumber: "INV-1092",
    supplierName: "SunPure Water Filtration Co.",
    notes: "4 High-capacity sub-surface solar submersible pumps and ceramic reverse-osmosis filtration units.",
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    imageData: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80",
  },
};

export const getEvidenceForExpense = (expenseId: number): OffChainEvidence | null => {
  if (typeof window === "undefined") return DEFAULT_RECEIPTS[expenseId] || null;
  try {
    const raw = localStorage.getItem(LOCAL_EVIDENCE_KEY);
    if (raw) {
      const items: Record<number, OffChainEvidence> = JSON.parse(raw);
      if (items[expenseId]) return items[expenseId];
    }
  } catch {}
  return DEFAULT_RECEIPTS[expenseId] || DEFAULT_RECEIPTS[1];
};

export const saveEvidenceForExpense = (
  expenseId: number,
  evidence: Omit<OffChainEvidence, "id" | "uploadedAt">
): OffChainEvidence => {
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
