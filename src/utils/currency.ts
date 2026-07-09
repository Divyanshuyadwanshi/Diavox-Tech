/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  GBP: "£",
  EUR: "€",
  "$": "$",
  "₹": "₹",
  "£": "£",
  "€": "€"
};

export const getCurrencySymbol = (currency: string): string => {
  if (!currency) return "$";
  const upper = currency.trim().toUpperCase();
  return CURRENCY_SYMBOLS[upper] || CURRENCY_SYMBOLS[currency] || currency || "$";
};

export const formatAmount = (amount: string | number | undefined | null, defaultCurrency: string = "USD"): string => {
  if (amount === undefined || amount === null) return "";
  const amountStr = String(amount).trim();
  if (amountStr === "") return "";

  // Detect which symbol is present
  let detectedSymbol = "";
  if (amountStr.includes("₹")) detectedSymbol = "₹";
  else if (amountStr.includes("$")) detectedSymbol = "$";
  else if (amountStr.includes("£")) detectedSymbol = "£";
  else if (amountStr.includes("€")) detectedSymbol = "€";
  else if (amountStr.includes("¥")) detectedSymbol = "¥";

  if (detectedSymbol) {
    // Extract the digits and format
    const cleanNum = amountStr.replace(/[^0-9.]/g, "");
    if (cleanNum !== "" && !isNaN(Number(cleanNum))) {
      const value = parseFloat(cleanNum);
      if (detectedSymbol === "₹") {
        return "₹" + value.toLocaleString("en-IN");
      } else if (detectedSymbol === "£") {
        return "£" + value.toLocaleString("en-GB");
      } else if (detectedSymbol === "€") {
        return "€" + value.toLocaleString("en-US");
      } else {
        return detectedSymbol + value.toLocaleString("en-US");
      }
    }
    return amountStr;
  }

  // If there's no detected symbol, check if it's numeric
  const cleanNum = amountStr.replace(/[^0-9.]/g, "");
  if (cleanNum === "" || isNaN(Number(cleanNum))) {
    return amountStr;
  }

  const value = parseFloat(cleanNum);
  const resolvedCurrency = defaultCurrency.trim().toUpperCase();
  const symbol = getCurrencySymbol(resolvedCurrency);

  if (resolvedCurrency === "INR" || symbol === "₹") {
    return "₹" + value.toLocaleString("en-IN");
  } else if (resolvedCurrency === "GBP" || symbol === "£") {
    return "£" + value.toLocaleString("en-GB");
  } else if (resolvedCurrency === "EUR" || symbol === "€") {
    return "€" + value.toLocaleString("en-US");
  } else {
    return symbol + value.toLocaleString("en-US");
  }
};
