import { createContext, useContext, useState } from "react";
import { mockAccounts } from "../data/accounts.data";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [accounts, setAccounts] = useState(mockAccounts);

  // Hàm lấy nhân viên đang hoạt động
  const getActiveStaff = () => {
    return accounts.filter(a => a.role === "staff" && a.status === "active");
  };

  return (
    <DataContext.Provider value={{ accounts, setAccounts, getActiveStaff }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}