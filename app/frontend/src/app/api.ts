import type { PredictionResult } from './types';

const API_BASE_URL_STORAGE_KEY = 'dmc-dustbin-monitor-api-base-url';
const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function normalizeApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return normalizeApiBaseUrl(DEFAULT_API_BASE_URL);
  }

  const stored = window.localStorage.getItem(API_BASE_URL_STORAGE_KEY);
  if (stored) {
    return normalizeApiBaseUrl(stored);
  }

  return normalizeApiBaseUrl(DEFAULT_API_BASE_URL);
}

export function saveApiBaseUrl(value: string): string {
  const normalized = normalizeApiBaseUrl(value);
  if (typeof window !== 'undefined') {
    if (normalized) {
      window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
    }
  }
  return normalized;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function resolveAssetUrl(path: string): string {
  const apiBaseUrl = getApiBaseUrl();
  if (!path) {
    return '';
  }
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  return `${apiBaseUrl}${path}`;
}

export async function analyzeImage(file: File): Promise<PredictionResult> {
  const apiBaseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${apiBaseUrl}/api/predict`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(payload?.detail || 'Prediction failed.');
  }
  return payload as PredictionResult;
}

export async function fetchHealth(): Promise<{
  status: string;
  model_ready: boolean;
  detail: string;
}> {
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/api/health`);
  if (!response.ok) {
    throw new ApiError('Could not reach backend.');
  }
  return response.json();
}
