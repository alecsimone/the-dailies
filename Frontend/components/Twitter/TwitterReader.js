import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Sidebar from '../Sidebar';
import Tweets from './Tweets';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';

const GET_TWITTER_LISTS = gql`
   query GET_TWITTER_LISTS {
      getTwitterLists {
         message
      }
   }
`;

const StyledTwitterReader = styled.div`
   display: flex;
   .sidebar {
      flex-basis: 25%;
      .listLink {
         cursor: pointer;
         }
         span {
            color: ${props => props.theme.lowContrastGrey};
            margin-left: 0.5rem;
         }
      }
   }
   .tweetArea {
      flex-basis: 75%;
      flex-grow: 1;
      position: relative;
      max-height: 100%;
      ${props => props.theme.scroll};
      padding: 2rem;
   }
`;

const TwitterReader = props => {
   const { list } = props;
   const { loading, error, data } = useQuery(GET_TWITTER_LISTS, { ssr: false });

   const [activeList, setActiveList] = useState(false);

   let content;
   if (loading) {
      content = <LoadingRing />;
   }

   if (error) {
      content = <ErrorMessage error={error} />;
   }

   let listElements;
   if (data) {
      const listData = JSON.parse(data.getTwitterLists.message);
      const dirtyListIDs = Object.keys(listData);
      const listIDs = dirtyListIDs.filter(
         listID => listID !== 'lastUpdateTime'
      );

      if (!activeList) {
         if (list != null) {
            const [defaultList] = listIDs.filter(
               listID =>
                  listData[listID].name.toLowerCase() === list.toLowerCase()
            );
            setActiveList(defaultList);
         } else {
            const [seeAllList] = listIDs.filter(
               listID => listData[listID].name.toLowerCase() === 'see all'
            );
            if (seeAllList) {
               setActiveList(seeAllList);
            } else {
               setActiveList('home');
            }
         }
      }

      listElements = listIDs.map(listID => {
         if (listID === 'lastUpdateTime') {
            return;
         }
         return (
            <div
               className="listLink"
               key={listID}
               onClick={() => setActiveList(listID)}
            >
               <a>{listData[listID].name}</a>
               <span>(###)</span>
            </div>
         );
      });

      content = <Tweets list={listData[activeList]} />;
   }

   return (
      <StyledTwitterReader>
         <Sidebar extraColumnTitle="Tweets" extraColumnContent={listElements} />
         <div className="tweetArea">{content}</div>
      </StyledTwitterReader>
   );
};
TwitterReader.propTypes = {
   list: PropTypes.string
};

export default TwitterReader;
