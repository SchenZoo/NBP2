export const getChatLink = (userId: number) => `${process.env.CLIENT_ENPOINT}/chat/${userId}`
export const getRelativeUserProfileLink = (userId: string) => `profile/${userId}`
