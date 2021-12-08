import Head from 'next/head';
import PropTypes from 'prop-types';

const Meta = () => (
   <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
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
