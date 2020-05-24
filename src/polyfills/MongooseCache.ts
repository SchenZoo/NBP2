import mongoose from "mongoose";

(mongoose as any).Query.prototype.cache = function (
  options?: { cacheKey: string } | boolean
) {
  if ((typeof options === "boolean" && options) || options === undefined) {
    this.cacheKey = this.model.modelName;
    this.useCache = true;
    return this;
  }
  if (typeof options === "object") {
    const { cacheKey } = options;
    this.cacheKey =
      cacheKey === null || cacheKey === undefined
        ? this.model.modelName
        : cacheKey;
    this.useCache = true;
  }
  return this;
};
