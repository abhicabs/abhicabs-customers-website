import { Alert } from 'react-native';
import { API_BASE, CLIENT_HEADER } from '../config/env';
import { tokenStore } from '../auth/tokenStore';

let FileSystem: any = null, Sharing: any = null;
try { FileSystem = require('expo-file-system'); } catch { /* */ }
try { Sharing = require('expo-sharing'); } catch { /* */ }

// Download a protected /files/:id with the auth token and open the share sheet.
export async function downloadAndShare(fileId: string, name = 'file') {
  if (!FileSystem?.downloadAsync) { Alert.alert('Not available', 'Install expo-file-system to download files in the app.'); return; }
  try {
    const token = tokenStore.getAccess();
    const to = `${FileSystem.cacheDirectory}${name.replace(/[^\w.\-]+/g, '_')}`;
    const res = await FileSystem.downloadAsync(`${API_BASE}/files/${fileId}`, to, {
      headers: { Authorization: token ? `Bearer ${token}` : '', 'X-Client': CLIENT_HEADER },
    });
    if (res?.status && res.status >= 400) { Alert.alert('Download failed', 'Could not fetch the file.'); return; }
    if (Sharing?.shareAsync && (await Sharing.isAvailableAsync())) await Sharing.shareAsync(res.uri);
    else Alert.alert('Saved', 'The file was downloaded.');
  } catch { Alert.alert('Download failed', 'Please try again.'); }
}
