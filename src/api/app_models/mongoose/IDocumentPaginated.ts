export interface IDocumentPaginated<T> {
  docs: T[];
  total: number;
  limit: number;
  offset: number;
}
