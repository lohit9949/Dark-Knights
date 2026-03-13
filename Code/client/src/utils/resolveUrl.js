// Resolve file URLs - handles both absolute URLs and local server paths
const SERVER_URL = 'http://localhost:5000';

export const resolveFileUrl = (url) => {
  if (!url) return '';
  // Already an absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Local server path like /uploads/files/xxx.pdf
  return `${SERVER_URL}${url}`;
};
