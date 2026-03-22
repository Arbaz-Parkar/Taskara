export type ServicePricingModel = "FIXED" | "PACKAGE" | "HOURLY";

export const normalizePricingModel = (value?: string | null): ServicePricingModel => {
  if (value === "PACKAGE" || value === "HOURLY") {
    return value;
  }

  return "FIXED";
};

export const getPricingModelLabel = (value?: string | null) => {
  const pricingModel = normalizePricingModel(value);

  if (pricingModel === "HOURLY") {
    return "Hourly";
  }

  if (pricingModel === "PACKAGE") {
    return "Package";
  }

  return "Fixed Price";
};

export const getPriceFieldLabel = (value?: string | null) => {
  const pricingModel = normalizePricingModel(value);

  if (pricingModel === "HOURLY") {
    return "Hourly Rate (INR)";
  }

  if (pricingModel === "PACKAGE") {
    return "Package Price (INR)";
  }

  return "Price (INR)";
};

export const getPriceFieldHelpText = (value?: string | null) => {
  const pricingModel = normalizePricingModel(value);

  if (pricingModel === "HOURLY") {
    return "Buyers will understand this as your per-hour rate.";
  }

  if (pricingModel === "PACKAGE") {
    return "Use this when one service listing is sold as one clearly defined package or bundle.";
  }

  return "Use one total price for the complete service.";
};

export const getPriceFieldPlaceholder = (value?: string | null) => {
  const pricingModel = normalizePricingModel(value);

  if (pricingModel === "HOURLY") {
    return "800";
  }

  if (pricingModel === "PACKAGE") {
    return "2500";
  }

  return "1500";
};

export const formatServicePrice = (price: number, value?: string | null) => {
  const pricingModel = normalizePricingModel(value);
  const amount = `\u20B9${price}`;

  if (pricingModel === "HOURLY") {
    return `${amount}/hr`;
  }

  if (pricingModel === "PACKAGE") {
    return `${amount}/package`;
  }

  return amount;
};

export const getServicePriceCaption = (value?: string | null) => {
  const pricingModel = normalizePricingModel(value);

  if (pricingModel === "HOURLY") {
    return "Hourly rate";
  }

  if (pricingModel === "PACKAGE") {
    return "Package price";
  }

  return "Fixed price";
};
