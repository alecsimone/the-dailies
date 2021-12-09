export const endpoint =
   process.env.NODE_ENV === 'development'
      ? `http://localhost:4000`
      : `https://playground.ouryou.org`;
export const endpointNoHTTP =
   process.env.NODE_ENV === 'development'
      ? `localhost:4000`
      : `playground.ouryou.org`;
export const home =
   process.env.NODE_ENV === 'development'
      ? 'http://localhost:6969'
      : 'https://ouryou.org';
export const homeNoHTTP =
   process.env.NODE_ENV === 'development' ? 'localhost:6969' : 'ouryou.org';
export const sidebarPerPage = 14;
export const perPage = 8;
export const minimumTranslationDistance = 40;
