import mongoose from "mongoose";

(mongoose as any).Query.prototype.paginate = function (
  skip: number,
  limit: number
) {
  this.allowPagination = true;
  this.paginationSkip = skip;
  this.paginationLimit = limit;
  this.skip(skip);
  this.limit(limit);
  return this;
};
