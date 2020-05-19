import Head from 'next/head';
import PropTypes from 'prop-types';

const Meta = () => (
   <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link
         rel="icon"
         type="image/png"
         href="https://ourdailies.org/logo-small.png"
      />
      <link
         rel="shortcut icon"
         type="image/x-icon"
         href="https://ourdailies.org/favicon.ico"
      />
      <link rel="stylesheet" type="text/css" href="/nprogress.css" />
      <link rel="stylesheet" href="https://use.typekit.net/iwq0uru.css" />
      <link
         href="https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
         rel="stylesheet"
      />
      <title>Our Dailies</title>
   </Head>
);
Meta.propTypes = {};

export default Meta;
