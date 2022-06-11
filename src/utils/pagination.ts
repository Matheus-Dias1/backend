/**
 * Encodes a node
 *
 * @param node id to be encoded
 * @returns the encoded cursor
 */
export const encodeCursor = (node: any) => {
  return Buffer.from(node, "binary").toString("base64");
};

/**
 * Decodes a node
 *
 * @param cursor a cursos
 * @returns the decoded cursor
 */
export const decodeCursor = (cursor: any) => {
  return Buffer.from(cursor, "base64").toString("binary");
};

export interface PageInfo {
  startCursor: any;
  endCursor: any;
  hasNextPage: boolean;
}
