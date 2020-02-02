import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { smallThingCardFields } from '../lib/CardInterfaces';
import ErrorMessage from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';
import Things from '../components/Archives/Things';

const SEARCH_QUERY = gql`
   query SEARCH_QUERY($string: String!) {
      search(string: $string) {
         ${smallThingCardFields}
      }
   }
`;

const search = ({ query }) => {
   const { s: string } = query;
   const { loading, error, data } = useQuery(SEARCH_QUERY, {
      variables: {
         string
      }
   });

   let content;
   if (error) {
      content = <ErrorMessage error={error} />;
   }
   if (data && data.search != null) {
      content = (
         <Things things={data.search} cardSize="regular" displayType="grid" />
      );
   }
   if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledPageWithSidebar>
         <Sidebar />
         <div className="mainSection">
            <h3 className="searchHeader">Results for "{string}"</h3>
            {content}
         </div>
      </StyledPageWithSidebar>
   );
};
search.getInitialProps = async ctx => ({ query: ctx.query });
search.propTypes = {
   query: PropTypes.shape({
      s: PropTypes.string
   })
};

export default search;
