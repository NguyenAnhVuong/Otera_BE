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
  deathAnniversaryComingAfterDays: {
    title: 'Lễ giỗ sắp đến',
    description: (deceasedName: string, days: number) =>
      `Còn ${days} ngày nữa là đến ngày giỗ của ${deceasedName}`,
    redirectTo: (id: number) => `/deceased/${id}`,
  },
  deathAnniversaryToday: {
    title: 'Hôm nay là ngày giỗ',
    description: (deceasedName: string) =>
      `Hôm nay là ngày giỗ của ${deceasedName}`,
    redirectTo: (id: number) => `/deceased/${id}`,
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
  declareDeceased: {
    title: 'Có khai báo phần mộ và tro cốt mới',
    description: (userName: string, deceasedName: string) =>
      `${userName} đã khai báo thông tin cho ${deceasedName}`,
    redirectTo: '/temple/deceased',
  },
  updateDeceased: {
    title: 'Có cập nhật phần mộ và tro cốt mới',
    description: (userName: string, deceasedName: string) =>
      `${userName} đã cập nhật thông tin cho ${deceasedName}`,
    redirectTo: (id: number) => `/deceased/${id}`,
  },
  approveDeceased: {
    title: 'Yêu cầu khai báo phần mộ và tro cốt đã được chấp nhận',
    description: (deceasedName: string) =>
      `Yêu cầu khai báo thông tin cho ${deceasedName} đã được chấp nhận`,
    redirectTo: (id: number) => `/deceased${id}`,
  },
  rejectDeceased: {
    title: 'Yêu cầu khai báo phần mộ và tro cốt đã bị từ chối',
    description: (deceasedName: string) =>
      `Yêu cầu khai báo thông tin cho ${deceasedName} đã bị từ chối`,
    redirectTo: '/temple/deceased',
  },
  deleteDeceased: {
    title: 'Phần mộ và tro cốt đã bị xoá',
    description: (userName: string, deceasedName: string) =>
      `${userName} đã xóa phần mộ và tro cốt của ${deceasedName} khỏi hệ thống`,
    redirectTo: '/temple/deceased',
  },
  restoreDeceased: {
    title: 'Phần mộ và tro cốt đã được khôi phục',
    description: (userName: string, deceasedName: string) =>
      `${userName} đã khôi phục phần mộ và tro cốt của ${deceasedName}`,
    redirectTo: (id: number) => `/deceased${id}`,
  },
  registerTemple: {
    title: 'Có yêu cầu đăng ký chùa mới',
    description: (userName: string, templeName: string) =>
      `${userName} đã gửi yêu cầu đăng ký chùa ${templeName}`,
    redirectTo: '/temple',
  },
  registerTemplesSent: {
    title: 'Yêu cầu đăng ký chùa đã được gửi',
    description: (templeName: string) =>
      `Yêu cầu đăng ký chùa ${templeName} đã được gửi. Vui lòng chờ xác nhận từ hệ thống`,
  },
  approveTemple: {
    title: 'Yêu cầu đăng ký chùa đã được chấp nhận',
    description: (templeName: string) =>
      `Yêu cầu đăng ký chùa ${templeName} đã được chấp nhận`,
    redirectTo: (id: number) => `/temple/${id}`,
  },
  approveTempleUser: {
    title: 'Yêu cầu đăng ký chùa đã được chấp nhận',
    description: (templeName: string) =>
      `Yêu cầu đăng ký chùa ${templeName} đã được chấp nhận. Vui lòng đăng nhập lại để sử dụng chức năng của chùa!`,
    redirectTo: (id: number) => `/temple/${id}`,
  },
  rejectTemple: {
    title: 'Yêu cầu đăng ký chùa đã bị từ chối',
    description: (templeName: string) =>
      `Yêu cầu đăng ký chùa ${templeName} đã bị từ chối`,
    redirectTo: '/system/temple',
  },
  blockTemple: {
    title: 'Chùa đã bị khóa',
    description: (templeName: string) =>
      `Chùa ${templeName} đã bị hệ thống khoá`,
    redirectTo: '/system/temple',
  },
};
