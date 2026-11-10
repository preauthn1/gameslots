export const baseUrlApi = (url: string) => {
  const domain = import.meta.env.VITE_API_BASE_URL;
  return `${domain}${url}`;
};
