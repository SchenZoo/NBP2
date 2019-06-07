export const getChatLink = (userId: number) => `${process.env.APP_URL}/chat/${userId}`
export const getRelativeUserProfileLink = (userId: string) => `profile/${userId}`
