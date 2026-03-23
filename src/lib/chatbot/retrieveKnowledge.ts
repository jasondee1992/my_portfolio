import type { KnowledgeEntry } from "@/lib/chatbot/loadKnowledge";

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+.#-]+/i)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

function levenshteinDistance(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;

      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function isCloseTokenMatch(queryToken: string, candidateToken: string) {
  if (queryToken === candidateToken) {
    return true;
  }

  if (
    queryToken.length <= 3 ||
    candidateToken.length <= 3 ||
    Math.abs(queryToken.length - candidateToken.length) > 2
  ) {
    return false;
  }

  const maxDistance = queryToken.length <= 5 ? 1 : 2;
  return levenshteinDistance(queryToken, candidateToken) <= maxDistance;
}

function countKeywordHits(queryTokens: string[], candidateTokens: string[]) {
  let exactHits = 0;
  let fuzzyHits = 0;

  for (const queryToken of queryTokens) {
    if (candidateTokens.includes(queryToken)) {
      exactHits += 1;
      continue;
    }

    const hasCloseMatch = candidateTokens.some((candidateToken) =>
      isCloseTokenMatch(queryToken, candidateToken)
    );

    if (hasCloseMatch) {
      fuzzyHits += 1;
    }
  }

  return { exactHits, fuzzyHits };
}

export type RetrievalMatch = {
  entry: KnowledgeEntry;
  score: number;
  keywordHits: number;
  fuzzyKeywordHits: number;
  titleHits: number;
  contentHits: number;
};

export function retrieveKnowledge(
  entries: KnowledgeEntry[],
  query: string,
  limit = 5
): RetrievalMatch[] {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return [];
  }

  const scored = entries
    .map((entry) => {
      const { exactHits, fuzzyHits } = countKeywordHits(queryTokens, entry.keywords);
      const keywordHits = exactHits;
      const fuzzyKeywordHits = fuzzyHits;

      const contentHits = queryTokens.filter((token) =>
        entry.content.toLowerCase().includes(token)
      ).length;

      const titleTokens = tokenize(entry.title);
      const titleMatchResult = countKeywordHits(queryTokens, titleTokens);
      const titleHits = titleMatchResult.exactHits + titleMatchResult.fuzzyHits;

      const score =
        keywordHits * 3 +
        fuzzyKeywordHits * 2 +
        titleHits * 2 +
        contentHits;

      return {
        entry,
        score,
        keywordHits,
        fuzzyKeywordHits,
        titleHits,
        contentHits,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
