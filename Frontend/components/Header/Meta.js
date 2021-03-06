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
      <title>Ouryou</title>
      <meta property="og:type" content="website" key="ogType" />
      <meta property="og:site_name" content="Ouryou" />
      <meta property="og:description" content="What will you learn today?" />
   </Head>
);
Meta.propTypes = {};

export default Meta;
