// Mock data tài khoản
export const mockAccounts = [
  {
    id: "ACC001",
    name: "Nguyễn Văn Admin",
    email: "admin@cinestar.vn",
    phone: "0912 345 678",
    role: "admin",
    status: "active",
    lastLogin: "06/03/2026",
    bookings: 0,
  },
  {
    id: "ACC002",
    name: "Trần Thị Staff",
    email: "staff1@cinestar.vn",
    phone: "0923 456 789",
    role: "staff",
    status: "active",
    lastLogin: "05/03/2026",
    bookings: 0,
  },
  {
    id: "ACC003",
    name: "Lê Minh Khoa",
    email: "khoa.le@gmail.com",
    phone: "0934 567 890",
    role: "user",
    status: "active",
    lastLogin: "06/03/2026",
    bookings: 24,
  },
  {
    id: "ACC004",
    name: "Phạm Thu Hương",
    email: "huong.pham@gmail.com",
    phone: "0945 678 901",
    role: "user",
    status: "active",
    lastLogin: "04/03/2026",
    bookings: 18,
  },
  {
    id: "ACC005",
    name: "Hoàng Anh Tuấn",
    email: "tuan.hoang@gmail.com",
    phone: "0956 789 012",
    role: "user",
    status: "inactive",
    lastLogin: "01/02/2026",
    bookings: 7,
  },
  {
    id: "ACC006",
    name: "Vũ Thị Mai",
    email: "mai.vu@gmail.com",
    phone: "0967 890 123",
    role: "staff",
    status: "active",
    lastLogin: "08/03/2026",
    bookings: 0,
  },
  {
    id: "ACC007",
    name: "Đinh Văn Long",
    email: "long.dinh@gmail.com",
    phone: "0978 901 234",
    role: "user",
    status: "banned",
    lastLogin: "15/01/2026",
    bookings: 3,
  },
  {
    id: "ACC008",
    name: "Bùi Thị Lan",
    email: "lan.bui@gmail.com",
    phone: "0989 012 345",
    role: "user",
    status: "active",
    lastLogin: "05/03/2026",
    bookings: 31,
  }
];

// Helper function để lấy danh sách nhân viên đang hoạt động
export const getActiveStaff = () => {
  return mockAccounts.filter(a => a.role === "staff" && a.status === "active");
};