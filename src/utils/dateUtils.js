// utils/dateUtils.js

/**
 * Format date từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị
 */
export const formatDateToDisplay = (dateString) => {
  if (!dateString) return '---';
  
  // Nếu đã có định dạng YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Nếu là ISO string, lấy phần date trước
  const datePart = dateString.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }
  
  return dateString;
};

/**
 * Format date từ YYYY-MM-DD sang DD/MM/YYYY
 */
export const formatDateToDMY = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Chuyển đổi từ DD/MM/YYYY sang YYYY-MM-DD
 */
export const convertDMYtoYMD = (dateString) => {
  if (!dateString) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

/**
 * Lấy ngày hiện tại theo định dạng YYYY-MM-DD (không bị ảnh hưởng múi giờ)
 */
export const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Lấy ngày mai theo định dạng YYYY-MM-DD
 */
export const getTomorrowDate = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Lấy ngày sau 7 ngày
 */
export const getWeekLaterDate = () => {
  const today = new Date();
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 7);
  const year = weekLater.getFullYear();
  const month = String(weekLater.getMonth() + 1).padStart(2, '0');
  const day = String(weekLater.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * So sánh hai ngày (chỉ so sánh YYYY-MM-DD)
 */
export const compareDates = (date1, date2) => {
  const d1 = date1.split('T')[0];
  const d2 = date2.split('T')[0];
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Kiểm tra date có phải hôm nay không
 */
export const isToday = (dateString) => {
  const today = getTodayDate();
  const compareDate = dateString.split('T')[0];
  return compareDate === today;
};

/**
 * Kiểm tra date có phải ngày mai không
 */
export const isTomorrow = (dateString) => {
  const tomorrow = getTomorrowDate();
  const compareDate = dateString.split('T')[0];
  return compareDate === tomorrow;
};

/**
 * Kiểm tra date có trong tuần này không (từ hôm nay đến 7 ngày sau)
 */
export const isThisWeek = (dateString) => {
  const today = getTodayDate();
  const weekLater = getWeekLaterDate();
  const compareDate = dateString.split('T')[0];
  return compareDate >= today && compareDate <= weekLater;
};

/**
 * Lấy ngày hiện tại theo định dạng DD/MM/YYYY
 */
export const getTodayDisplay = () => {
  const today = getTodayDate();
  return formatDateToDisplay(today);
};