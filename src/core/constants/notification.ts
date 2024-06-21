export const Notifications = {
  inviteFamily: {
    title: 'Bạn nhận được một lời mời tham gia gia đình',
    description: (from: string, familyName: string) =>
      `${from} mời bạn tham gia gia đình ${familyName}`,
  },
  newEvent: {
    title: (templeName: string) => `Chùa ${templeName} đã tạo sự kiện mới`,
    description: (templeName: string, eventName: string) =>
      `Chùa ${templeName} vừa mới tạo sự kiện ${eventName}`,
    redirectTo: (eventId: number) => `/event/${eventId}`,
  },
  updateEvent: {
    title: (templeName: string) => `Chùa ${templeName} đã cập nhật sự kiện`,
    description: (templeName: string, eventName: string) =>
      `Chùa ${templeName} vừa mới cập nhật thông tin sự kiện ${eventName}`,
    redirectTo: (eventId: number) => `/event/${eventId}`,
  },
  cancelEvent: {
    title: (templeName: string) => `Chùa ${templeName} đã hủy sự kiện`,
    description: (templeName: string, eventName: string) =>
      `Chùa ${templeName} đã hủy tổ chức sự kiện ${eventName}`,
  },
  approveBookingEvent: {
    title: 'Đăng ký tham gia sự kiện đã được chấp nhận',
    description: (eventName: string) =>
      `Bạn đã được cho phép tham gia ${eventName}`,
    redirectTo: (eventId: number) => `/event/${eventId}`,
  },
  rejectBookingEvent: {
    title: 'Đăng ký tham gia sự kiện đã bị từ chối',
    description: (eventName: string) =>
      `Bạn đã bị từ chối tham gia ${eventName}`,
    redirectTo: (eventId: number) => `/event/${eventId}`,
  },
  requestDeathAnniversary: {
    title: 'Có yêu cầu tổ chức lễ giỗ mới',
    description: (deceasedName: string) =>
      `Có yêu cầu tổ chức lễ giỗ tưởng nhớ ${deceasedName}`,
    redirectTo: '/death-anniversary',
  },
  approveDeathAnniversary: {
    title: 'Yêu cầu tổ chức lễ giỗ đã được chấp nhận',
    description: (deceasedName: string) =>
      `Yêu cầu tổ chức lễ giỗ tưởng nhớ ${deceasedName} đã được chấp nhận`,
    redirectTo: '/death-anniversary',
  },
  rejectDeathAnniversary: {
    title: 'Yêu cầu tổ chức lễ giỗ đã bị từ chối',
    description: (deceasedName: string) =>
      `Yêu cầu tổ chức lễ giỗ tưởng nhớ ${deceasedName} đã bị từ chối`,
    redirectTo: '/death-anniversary',
  },
  readyDeathAnniversary: {
    title: 'Lễ giỗ đã sẵn sàng',
    description: (deceasedName: string) =>
      `Lễ giỗ tưởng nhớ ${deceasedName} đã sẵn sàng`,
    redirectTo: '/death-anniversary',
  },
  finishDeathAnniversary: {
    title: 'Lễ giỗ đã hoàn thành',
    description: (deceasedName: string) =>
      `Lễ giỗ tưởng nhớ ${deceasedName} đã hoàn thành`,
    redirectTo: '/death-anniversary',
  },
  contributeImage: {
    title: 'Có ảnh kỷ niệm mới',
    description: (userName: string, deceasedName: string) =>
      `${userName} đã đóng góp ảnh cho ${deceasedName}`,
    redirectTo: (id: number) => `/deceased/${id}`,
  },
};
