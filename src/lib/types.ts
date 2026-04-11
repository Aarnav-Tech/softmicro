// ─── Shared domain types ────────────────────────────────────────────────────

export type Architecture =
  | "x64"
  | "x86"
  | "arm"
  | "arm64"
  | "neutral"
  | "unknown";

export type PackageType =
  | "msixbundle"
  | "appxbundle"
  | "msix"
  | "appx"
  | "eappx"
  | "emsix"
  | "unknown";

export interface AppFile {
  /** Human-readable filename */
  fileName: string;
  /** Semantic version string */
  version: string;
  /** CPU architecture */
  architecture: Architecture;
  /** File size in bytes */
  fileSize: number;
  /** Package type */
  type: PackageType;
  /** Direct download URL */
  downloadUrl: string;
  /** Whether this is the latest stable release */
  isLatest: boolean;
  /** SHA1 of the package (if available) */
  sha1?: string;
}

export interface AppResult {
  productId: string;
  files: AppFile[];
  fetchedAt: number; // Unix ms
}

// ─── API response shapes ─────────────────────────────────────────────────────

export interface ApiSuccessResponse {
  ok: true;
  data: AppResult;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  code: "INVALID_INPUT" | "RATE_LIMITED" | "UPSTREAM_ERROR" | "NOT_FOUND";
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// ─── Filter state (frontend) ─────────────────────────────────────────────────

export interface FilterState {
  architectures: Architecture[];
  types: PackageType[];
  latestOnly: boolean;
}
