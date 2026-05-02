import { App as CapApp } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';

export interface VersionInfo {
  version: string;
  releaseNotes: string;
  apkUrl: string;
  minOsVersion?: string;
  forceUpdate?: boolean;
}

const UPDATE_CONFIG_URL = "https://raw.githubusercontent.com/OWNER/REPO/main/version.json";
// NOTE: In a real app, the user should replace OWNER and REPO with their actual GitHub details.
// Or use GitHub Releases API: https://api.github.com/repos/OWNER/REPO/releases/latest

const IGNORED_VERSION_KEY = 'detricon_ignored_version';

export interface UpdateStatus {
  hasUpdate: boolean;
  latestVersion?: VersionInfo;
  currentVersion?: string;
}

export async function checkUpdate(): Promise<UpdateStatus> {
  try {
    const info = await CapApp.getInfo();
    const currentVersion = info.version;
    
    // Fetch the version.json from GitHub
    // We use a cache-busting query param to ensure we get the latest
    const response = await fetch(`${UPDATE_CONFIG_URL}?t=${Date.now()}`);
    if (!response.ok) return { hasUpdate: false };
    
    const latest: VersionInfo = await response.json();
    
    // Check if this version is ignored
    const ignoredVersion = localStorage.getItem(IGNORED_VERSION_KEY);
    if (ignoredVersion === latest.version && !latest.forceUpdate) {
      return { hasUpdate: false };
    }

    // Simple semver comparison (or string comparison if you prefer)
    if (isNewerVersion(currentVersion, latest.version)) {
      return { 
        hasUpdate: true, 
        latestVersion: latest,
        currentVersion 
      };
    }

    return { hasUpdate: false };
  } catch (error) {
    console.error('Update check failed:', error);
    return { hasUpdate: false };
  }
}

function isNewerVersion(current: string, latest: string): boolean {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const vC = c[i] || 0;
    const vL = l[i] || 0;
    if (vL > vC) return true;
    if (vL < vC) return false;
  }
  return false;
}

export function ignoreVersion(version: string) {
  localStorage.setItem(IGNORED_VERSION_KEY, version);
}

export async function downloadAndInstall(
  apkUrl: string, 
  onProgress: (progress: number) => void
): Promise<void> {
  try {
    // 1. Download the APK
    const response = await fetch(apkUrl);
    if (!response.ok) throw new Error("Failed to download APK");
    
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Could not read response body");

    const chunks: Uint8Array[] = [];
    
    while(true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (total) {
        onProgress(loaded / total);
      }
    }

    const blob = new Blob(chunks);
    const base64Data = await blobToBase64(blob);

    // 2. Save to Filesystem
    const fileName = `detricon_update_${Date.now()}.apk`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.External, // Use External so the installer can see it
    });

    // 3. Open the file to trigger install
    // The FileOpener plugin handles the Intent and FileProvider configuration
    await FileOpener.openFile({
      path: savedFile.uri,
      mimeType: 'application/vnd.android.package-archive',
    });

  } catch (error) {
    console.error('Download or install failed:', error);
    throw error;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
