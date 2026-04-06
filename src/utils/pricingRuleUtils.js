const toUpper = (value) => (typeof value === "string" ? value.toUpperCase() : value);

export const getPricingRulePricingType = (rule = {}) => {
  const explicit = rule.pricing_type ?? rule.pricingType;
  if (explicit) return toUpper(String(explicit));

  const legacyType = rule.type;
  if (toUpper(String(legacyType)) === "HOLIDAY") return "HOLIDAY";

  if (rule.start_date && rule.end_date) return "HOLIDAY";
  if (rule.holiday_data || rule.holiday_prices) return "HOLIDAY";

  return "REGULAR";
};

export const isHolidayPricingRule = (rule = {}) =>
  getPricingRulePricingType(rule) === "HOLIDAY";

export const getPricingRuleRoomType = (rule = {}) => {
  const pricingType = getPricingRulePricingType(rule);

  const roomTypeFromFields = rule.room_type ?? rule.roomType;
  if (roomTypeFromFields) return String(roomTypeFromFields);

  if (pricingType === "HOLIDAY") {
    const holidayRoomType = rule.holiday_room_type ?? rule.holidayRoomType;
    if (holidayRoomType) return String(holidayRoomType);

    const legacyType = rule.type;
    if (legacyType && toUpper(String(legacyType)) !== "HOLIDAY") {
      return String(legacyType);
    }

    return "2D";
  }

  return rule.type ? String(rule.type) : "2D";
};
