import PropTypes from 'prop-types';
import styled from 'styled-components';
import { setAlpha } from '../../styles/functions';
import ListElement from './ListElement';
import ResetIcon from '../Icons/Reset';
import LoadingRing from '../LoadingRing';
import TimeAgo from '../TimeAgo';

const StyledTwitterSidebar = styled.div`
   padding: 0 2rem;
   h5 {
      font-size: ${props => props.theme.bigText};
      position: relative;
      margin: 1rem 0;
      a.twitterName {
         color: ${props => props.theme.secondaryAccent};
      }
   }
   .listLink {
      padding: 0.6rem 1rem;
      border-radius: 3px;
      line-height: 1;
      a,
      a:visited {
         color: ${props => props.theme.mainText};
      }
      &.selected,
      &:hover {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      }
      &.loading {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.5)};
      }
      cursor: pointer;
      span {
         color: ${props => props.theme.lowContrastGrey};
         margin-left: 0.5rem;
         font-weight: 300;
      }
   }
   .updateLists {
      font-size: ${props => props.theme.tinyText};
      color: ${props => props.theme.lowContrastGrey};
      margin: 2rem 0 1rem;
      ${props => props.theme.mobileBreakpoint} {
         margin: 2rem 0 0 0;
      }
      display: flex;
      align-items: center;
      svg {
         margin-left: 1rem;
         width: ${props => props.theme.smallText};
         opacity: 0.75;
         ${props => props.theme.mobileBreakpoint} {
            opacity: 0.6;
         }
         cursor: pointer;
         transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
         &:hover {
            opacity: 1;
         }
         &.loading {
            ${props => props.theme.spinBackward};
         }
      }
   }
`;

const TwitterSidebar = ({
   myTwitterInfo,
   activeList,
   activeTweetCount,
   setActiveList,
   setActiveTweets,
   fetchFreshLists
}) => {
   if (!myTwitterInfo) {
      return (
         <StyledTwitterSidebar className="twitterSidebar">
            <LoadingRing />
         </StyledTwitterSidebar>
      );
   }

   // Make an array of the member's lists
   const listsObject = JSON.parse(myTwitterInfo.me.twitterListsObject);
   const dirtyListIDs = Object.keys(listsObject);
   const listIDs = dirtyListIDs.filter(listID => listID !== 'lastUpdateTime');

   // Get a ListElement for each one
   const listElements = listIDs.map(listID => {
      if (listID === 'lastUpdateTime') {
         return;
      }
      return (
         <ListElement
            listID={listID}
            key={listID}
            active={activeList === listID}
            activeTweetCount={activeTweetCount}
            memberInfo={myTwitterInfo.me}
            setActiveList={setActiveList}
            setActiveTweets={setActiveTweets}
         />
      );
   });

   return (
      <StyledTwitterSidebar className="twitterSidebar">
         <h5 key="twiterUsername">
            Welcome, @
            <a
               className="twitterName"
               href={`https://twitter.com/${myTwitterInfo.me.twitterUserName}`}
               target="_blank"
            >
               {myTwitterInfo.me.twitterUserName}
            </a>
         </h5>
         {listElements}
         <div className="updateLists" key="updateLists">
            Last updated{' '}
            <TimeAgo time={listsObject.lastUpdateTime} toggleable />
            <ResetIcon
               className="refreshLists"
               onClick={() => {
                  const el = document.querySelector('svg.refreshLists');
                  el.classList.add('loading');
                  fetchFreshLists();
               }}
            />
         </div>
      </StyledTwitterSidebar>
   );
};

TwitterSidebar.propTypes = {
   myTwitterInfo: PropTypes.shape({
      me: PropTypes.object.isRequired
   }),
   activeList: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
      .isRequired,
   activeTweetCount: PropTypes.number,
   setActiveList: PropTypes.func.isRequired,
   setActiveTweets: PropTypes.func.isRequired
};

export default TwitterSidebar;
