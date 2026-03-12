import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedComboIds, setSelectedComboIds] = useState([]);

  const totalPrice =
    (selectedShowtime?.price ?? 0) * selectedSeats.length;

  const clearBooking = () => {
    setSelectedMovie(null);
    setSelectedDate("");
    setSelectedCinema(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSelectedComboIds([]);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        selectedDate,
        selectedCinema,
        selectedShowtime,
        selectedSeats,
        selectedComboIds,
        totalPrice,
        setSelectedMovie,
        setSelectedDate,
        setSelectedCinema,
        setSelectedShowtime,
        setSelectedSeats,
        setSelectedComboIds,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};
export default BookingProvider;