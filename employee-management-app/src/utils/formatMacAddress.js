export const formatMacAddress = (mac) => {
  if (!mac) return mac;
  return mac.replace(/-/g, ":").toLowerCase();
};
