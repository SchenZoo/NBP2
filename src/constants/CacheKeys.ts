export const CACHE_KEYS = {
  ITEM_USER: (userId: string) => `user-${userId}`,
  ITEM_SECTION: (sectionId: string) => `section-${sectionId}`,
  ITEM_GROUP: (groupId: string) => `group-${groupId}`,
};
