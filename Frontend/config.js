export const endpoint =
   process.env.NODE_ENV === 'development'
      ? `http://localhost:4000`
      : `https://dailies-server.herokuapp.com/`;
export const endpointNoHTTP =
   process.env.NODE_ENV === 'development'
      ? `localhost:4000`
      : `dailies-server.herokuapp.com/`;
export const home =
   process.env.NODE_ENV === 'development'
      ? 'http://localhost:6969'
      : 'https://ourdailies.org';
export const homeNoHTTP =
   process.env.NODE_ENV === 'development' ? 'localhost:6969' : 'ourdailies.org';
