import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import Page from '../components/Page';
import apolloCreator from '../lib/apolloCreator';

class MyApp extends App {
   static async getInitialProps({ Component, ctx }) {
      let pageProps = {};
      if (Component.getInitialProps) {
         pageProps = await Component.getInitialProps(ctx);
      }
      pageProps.query = ctx.query;
      return { pageProps };
   }

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
