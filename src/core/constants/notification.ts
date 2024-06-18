export const Notifications = {
  inviteFamily: {
    title: 'Bạn nhận được một lời mời tham gia gia đình',
    description: (from: string, familyName: string) =>
      `${from} mời bạn tham gia gia đình ${familyName}`,
  },
  newEvent: {
    title: (templeName: string) => `${templeName} đã tạo sự kiện mới`,
    description: (from: string, eventName: string) =>
      `${from} vừa mới tạo sự kiện ${eventName}`,
    redirectTo: (eventId: number) => `/event/${eventId}`,
  },
};
