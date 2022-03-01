import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Head from 'next/head';
import LinkArchive from '../components/LinkArchive/LinkArchive';
import LoadingRing from '../components/LoadingRing';
import { fullPersonalLinkFields } from '../lib/CardInterfaces';

const LINK_ARCHIVE_QUERY = gql`
   query LINK_ARCHIVE_QUERY {
      getLinkArchive {
         id
         ownedLinks {
            ${fullPersonalLinkFields}
         }
      }
   }
`;

const Links = () => {
   const { loading, error, data } = useQuery(LINK_ARCHIVE_QUERY);

   return (
      <div>
         <Head>
            <title>Link Archive - Ouryou</title>
            <meta property="og:title" content="Link Archive - Ouryou" />
         </Head>
         {loading && <LoadingRing />}
         {data && <LinkArchive links={data.getLinkArchive.ownedLinks} />}
      </div>
   );
};

export default Links;
