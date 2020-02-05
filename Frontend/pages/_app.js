import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import Page from '../components/Page';
import apolloCreator from '../lib/apolloCreator';

if (process.browser) {
   if (
      window.location.protocol === 'http:' &&
      window.location.hostname !== 'localhost'
   ) {
      const oldLocation = window.location.href;
      const newLocation = oldLocation.replace(/http/i, 'https');
      window.location.replace(newLocation);
   }
}

class MyApp extends App {
   render() {
      const { Component, apollo, pageProps } = this.props;
      return (
         <ApolloProvider client={apollo}>
            <Page>
               <Component {...pageProps} />
            </Page>
         </ApolloProvider>
      );
   }
}

export default apolloCreator(MyApp);
