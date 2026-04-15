/**
 * Inquiry data layer
 *
 * 현재: localStorage (개발/데모용)
 * Vercel 배포 시: 이 파일만 Vercel KV 또는 Supabase로 교체하면 됨
 *
 * 모든 컴포넌트는 이 모듈의 함수만 호출하므로,
 * 백엔드를 바꿔도 UI 코드는 수정 불필요.
 */

export interface Inquiry {
  id: string;
  type: 'check' | 'urgent';
  tool: string | null;
  projectUrl: string | null;
  visitType: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  timestamp: string;
  status: 'new' | 'contacted' | 'quoted' | 'paid' | 'inspecting' | 'done';
  notes: string;
}

const STORAGE_KEY = 'byteforce_inquiries';

// --- Read ---
export function getInquiries(): Inquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate old format (no id/status) to new format
    return parsed.map((item: any, i: number) => ({
      id: item.id || `inq_${Date.now()}_${i}`,
      type: item.type || 'check',
      tool: item.tool || null,
      projectUrl: item.projectUrl || null,
      visitType: item.visitType || null,
      email: item.email || '',
      phone: item.phone || null,
      message: item.message || null,
      timestamp: item.timestamp || new Date().toISOString(),
      status: item.status || 'new',
      notes: item.notes || '',
    }));
  } catch {
    return [];
  }
}

// --- Write (from contact form) ---
export function addInquiry(data: Omit<Inquiry, 'id' | 'status' | 'notes'>): Inquiry {
  const inquiry: Inquiry = {
    ...data,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status: 'new',
    notes: '',
  };

  const existing = getInquiries();
  existing.push(inquiry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  console.log('[Byteforce] New inquiry:', inquiry);
  return inquiry;
}

// --- Update status (admin) ---
export function updateInquiry(id: string, updates: Partial<Pick<Inquiry, 'status' | 'notes'>>): void {
  const all = getInquiries();
  const idx = all.findIndex(inq => inq.id === id);
  if (idx === -1) return;

  if (updates.status) all[idx].status = updates.status;
  if (updates.notes !== undefined) all[idx].notes = updates.notes;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// --- Delete (admin) ---
export function deleteInquiry(id: string): void {
  const all = getInquiries().filter(inq => inq.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// --- Stats ---
export function getStats() {
  const all = getInquiries();
  return {
    total: all.length,
    new: all.filter(i => i.status === 'new').length,
    contacted: all.filter(i => i.status === 'contacted').length,
    quoted: all.filter(i => i.status === 'quoted').length,
    paid: all.filter(i => i.status === 'paid').length,
    inspecting: all.filter(i => i.status === 'inspecting').length,
    done: all.filter(i => i.status === 'done').length,
  };
}
