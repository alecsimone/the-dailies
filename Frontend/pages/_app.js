import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import { Provider } from 'react-redux';
import Page from '../components/Page';
import apolloCreator from '../lib/apolloCreator';
import stuffStore from '../stuffStore/configureStore';

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
      const { Component, apollo, apolloState, pageProps } = this.props;

      if (process.browser) {
         if (
            window.location.protocol === 'http:' &&
            window.location.hostname !== 'localhost'
         ) {
            return <div>Switching to a secure connection...</div>;
         }
      }

      return (
         <ApolloProvider client={apollo}>
            <Provider store={stuffStore}>
               <Page pageProps={pageProps}>
                  <Component {...pageProps} prefetchedData={apolloState.data} />
               </Page>
            </Provider>
         </ApolloProvider>
      );
   }
}

export default apolloCreator(MyApp);
