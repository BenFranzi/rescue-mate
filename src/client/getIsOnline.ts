const getIsOnline = () => ('onLine' in navigator) && navigator.onLine;

export default getIsOnline;