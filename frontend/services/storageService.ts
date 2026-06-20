// services/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

const STORAGE_KEY = 'provision_user_profile';
const DOC_CHECKS_PREFIX = 'provision_doc_checks_';

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function saveDocumentChecks(
  deadlineId: string,
  checks: Record<string, boolean>,
): Promise<void> {
  await AsyncStorage.setItem(DOC_CHECKS_PREFIX + deadlineId, JSON.stringify(checks));
}

export async function loadDocumentChecks(
  deadlineId: string,
): Promise<Record<string, boolean>> {
  const raw = await AsyncStorage.getItem(DOC_CHECKS_PREFIX + deadlineId);
  return raw ? JSON.parse(raw) : {};
}
