export const PRICE_TIERS = ["Thường", "VIP", "Couple"];

export const DEFAULT_REGULAR_PRICES = {
  Thường: 90000,
  VIP: 108000,
  Couple: 135000,
};

export const SEAT_TYPE_TO_TIER = {
  standard: "Thường",
  vip: "VIP",
  couple: "Couple",
};

const normalizeMoney = (value, fallback = 0) => {
  const amount = Number(value);
  if (Number.isFinite(amount) && amount >= 0) {
    return Math.round(amount);
  }
  return fallback;
};

export const normalizePriceMap = (prices, fallbackPrices = DEFAULT_REGULAR_PRICES) => {
  const source = prices && typeof prices === "object" ? prices : {};

  return PRICE_TIERS.reduce((acc, tier) => {
    acc[tier] = normalizeMoney(source[tier], fallbackPrices[tier] ?? 0);
    return acc;
  }, {});
};

export const normalizeShowtimePricing = (showtime = {}) => {
  const basePrice = Number(showtime.base_price ?? showtime.price ?? DEFAULT_REGULAR_PRICES.Thường);
  const derivedFromBase = Number.isFinite(basePrice)
    ? {
        Thường: basePrice,
        VIP: Math.round(basePrice * 1.2),
        Couple: Math.round(basePrice * 1.5),
      }
    : DEFAULT_REGULAR_PRICES;

  const legacyPrices = normalizePriceMap(showtime.prices, DEFAULT_REGULAR_PRICES);
  const hasLegacyPriceFields = Boolean(showtime.prices || showtime.base_price || showtime.price);
  const regularSource = showtime.regularPrices || showtime.regular_prices || (!showtime.isSpecial && hasLegacyPriceFields ? legacyPrices : null);
  const regularPrices = normalizePriceMap(
    regularSource,
    normalizePriceMap(derivedFromBase, DEFAULT_REGULAR_PRICES)
  );

  const specialSource = showtime.specialPrices || showtime.special_prices;
  const specialPrices = specialSource
    ? normalizePriceMap(specialSource, regularPrices)
    : showtime.isSpecial || showtime.special || showtime.is_special
      ? normalizePriceMap(legacyPrices, regularPrices)
      : null;

  const isSpecial = Boolean(
    showtime.isSpecial ?? showtime.special ?? showtime.is_special ?? false
  );

  const effectivePrices = isSpecial && specialPrices ? specialPrices : regularPrices;

  return {
    isSpecial,
    regularPrices,
    specialPrices,
    prices: effectivePrices,
    basePrice: effectivePrices.Thường,
    derivedFromBase,
    priceSource: isSpecial ? "special" : "regular",
  };
};

export const getSeatPriceTier = (seatType) => SEAT_TYPE_TO_TIER[seatType] || "Thường";

export const getShowtimeSeatPrice = (showtime, seatType) => {
  const { prices } = normalizeShowtimePricing(showtime);
  const tier = getSeatPriceTier(seatType);
  return prices[tier] ?? 0;
};

export const calculateShowtimeTotal = (showtime, seats = []) => {
  return seats.reduce((sum, seat) => sum + getShowtimeSeatPrice(showtime, seat.type), 0);
};
