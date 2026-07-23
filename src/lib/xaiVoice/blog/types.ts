export type BlogReaderStatus = "unavailable" | "idle" | "reading" | "paused" | "completed" | "interrupted" | "stopped";

export type BlogArticleInput = {
  id: string;
  route: string;
  title: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  estimatedReadingTime?: string;
  contentHtml: string;
  imageAlt?: string;
};

export type BlogSection = {
  sectionId: string;
  heading: string;
  order: number;
  textBlocks: string[];
  estimatedDurationSeconds: number;
};

export type BlogChunk = {
  articleId: string;
  chunkId: string;
  sectionId: string;
  sectionHeading?: string;
  narrationText: string;
  chunkNumber: number;
  totalChunkCount: number;
  progressBeforePlayback: number;
  finalChunk: boolean;
  narrationGeneration: number;
};

export type BlogReadingState = {
  status: BlogReaderStatus;
  articleTitle: string | null;
  currentSection: string | null;
  currentChunk: string | null;
  progressPercentage: number;
  remainingEstimatedDuration: number;
  canResume: boolean;
  finalChunkCompleted: boolean;
};
