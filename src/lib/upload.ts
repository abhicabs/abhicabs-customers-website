import * as DocumentPicker from 'expo-document-picker';
import { ApiError } from '../api/client';
import { API_BASE, CLIENT_HEADER } from '../config/env';
import { tokenStore } from '../auth/tokenStore';

// Pick a file and upload it to /files with the given purpose. Returns { id, name } or null if cancelled.
export async function pickAndUpload(purpose: string, types: string[] = ['image/*', 'application/pdf']): Promise<{ id: string; name: string } | null> {
  const picked = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets?.[0]) return null;
  const a = picked.assets[0];
  const token = tokenStore.getAccess();
  const blob = await (await fetch(a.uri)).blob();
  const up = await fetch(`${API_BASE}/files?purpose=${purpose}`, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '', 'X-Client': CLIENT_HEADER, 'X-File-Name': encodeURIComponent(a.name ?? 'file'), 'Content-Type': a.mimeType ?? 'application/octet-stream' },
    body: blob,
  });
  const j = await up.json().catch(() => ({} as any));
  if (!up.ok || !j?.data?.id) throw new ApiError({ status: up.status, ...(j?.error || { message: 'Upload failed' }) });
  return { id: j.data.id, name: a.name ?? 'file' };
}
