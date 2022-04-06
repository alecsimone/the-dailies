import Head from 'next/head';
import PropTypes from 'prop-types';
import { home } from '../../config';

const Meta = () => (
   <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link
         rel="apple-touch-icon"
         sizes="180x180"
         href="/apple-touch-icon.png?v=2"
      />
      <link
         rel="icon"
         type="image/png"
         sizes="32x32"
         href="/favicon-32x32.png?v=2"
      />
      <link
         rel="icon"
         type="image/png"
         sizes="16x16"
         href="/favicon-16x16.png?v=2"
      />
      <link rel="manifest" href="/site.webmanifest?v=2" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg?v=2" color="#0066cc" />
      <link rel="shortcut icon" href={`${home}/favicon.ico?v=2`} />
      <meta name="msapplication-TileColor" content="#030303" />
      <meta name="theme-color" content="#0066cc" />
      <link rel="stylesheet" type="text/css" href="/nprogress.css" />
      <link rel="stylesheet" href="https://use.typekit.net/iwq0uru.css" />
      <title>Ouryou</title>
      <meta property="og:type" content="website" key="ogType" />
      <meta property="og:site_name" content="Ouryou" />
      <meta property="og:description" content="What will you learn today?" />
      <meta property="og:icon" content={`${home}/logo.png`} />
   </Head>
);
Meta.propTypes = {};

export default Meta;
