export const endpoint =
   process.env.NODE_ENV === 'development'
      ? `http://localhost:4000`
      : `https://playground.ourdailies.org`;
export const endpointNoHTTP =
   process.env.NODE_ENV === 'development'
      ? `localhost:4000`
      : `playground.ourdailies.org`;
export const home =
   process.env.NODE_ENV === 'development'
      ? 'http://localhost:6969'
      : 'https://ourdailies.org';
export const homeNoHTTP =
   process.env.NODE_ENV === 'development' ? 'localhost:6969' : 'ourdailies.org';
export const sidebarPerPage = 14;
export const perPage = 8;
export const minimumTranslationDistance = 40;
