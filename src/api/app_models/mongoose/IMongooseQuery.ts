import { Query } from "mongoose";

export interface IMongooseQuery<T> extends Query<T> {
  /**
   * @description returns cached results if they can match sent query or caches them when finished
   */
  cache(options?: { cacheKey: string } | boolean): IMongooseQuery<T>;
  /**
   * @description paginates given query
   */
  paginate(skip: number, limit: number): IMongooseQuery<T>;
}
