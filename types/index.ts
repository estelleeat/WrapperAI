export interface GeneratedContent {
  blogPost: string;
  twitterThread: string[];
  linkedinPost: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: any;
  embedding?: number[];
}
