export const WITH_CONNECTIONS_OMIT_ACCESS_TOKEN = {
  include: {
    myConnectionArray: {
      omit: {
        accessToken: true,
        publicToken: true,
        itemId: true,
        transferId: true,
      },
    },
  },
};
