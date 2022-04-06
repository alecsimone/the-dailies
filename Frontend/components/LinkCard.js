import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { linkFields } from '../lib/CardInterfaces';
import useQueryAndStoreIt from '../stuffStore/useQueryAndStoreIt';
import { setAlpha, setLightness } from '../styles/functions';
import LoadingRing from './LoadingRing';
import ShortLink from './ThingParts/ShortLink';
import ResetIcon from './Icons/Reset';
import useMe from './Account/useMe';

const LINK_DATA_QUERY = gql`
   query LINK_DATA_QUERY($url: String!, $storePersonalLink: Boolean) {
      getLinkData(url: $url, storePersonalLink: $storePersonalLink) {
         ${linkFields}
      }
   }
`;

const REFRESH_LINK_MUTATION = gql`
   mutation REFRESH_LINK_MUTATION($url: String!) {
      refreshLink(url: $url) {
         ${linkFields}
      }
   }
`;

const StyledLinkCard = styled.div`
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
   padding: 1rem;
   border-radius: 4px;
   margin-top: 0.5rem;
   position: relative;
   &.titleLinkOnly {
      display: flex;
   }
   a.wrapperLink {
      display: flex;
   }
   a,
   a:visited {
      display: block;
      width: 100%;
      color: ${props => props.theme.mainText};
      &:hover {
         text-decoration: none;
         color: ${props => props.theme.mainText};
      }
   }
   svg.updateCard {
      width: ${props => props.theme.tinyText};
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      cursor: pointer;
      opacity: 0.5;
      &:hover {
         opacity: 0.8;
      }
      &.loading {
         ${props => props.theme.spinBackward};
      }
   }
   .siteName a,
   .siteName a:visited {
      display: inline;
      width: auto;
      color: ${props => setLightness(props.theme.majorColor, 75)};
      &:hover {
         text-decoration: underline;
      }
   }
   &.poster {
      padding: 0;
      a.wrapperLink {
         flex-wrap: wrap;
         .linkCardInfo {
            padding: 1rem;
         }
      }
   }
   .linkCardInfo {
      padding-right: 1rem;
      flex-grow: 1;
      &.icon {
         border-right: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
      }
      /* flex-grow: 1; */
      .siteName,
      .title {
         font-weight: 500;
      }
   }
   .linkCardLogo {
      padding-left: 1rem;
      display: flex;
      align-items: center;
      width: 10rem;
      max-width: 12rem;
      ${props => props.theme.mobileBreakpoint} {
         width: 20rem;
         max-width: 22rem;
      }
      overflow: hidden;
      img {
         max-height: 15rem;
         width: 100%;
         object-fit: contain;
      }
   }
   .linkCardPoster {
      width: 100%;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      img {
         width: 100%;
         max-height: 36rem;
         object-fit: contain;
         object-position: center center;
         border-radius: 0 0 4px 4px;
      }
   }
`;

const useLinkData = link => useSelector(state => state.stuff[`Link:${link}`]);

const LinkCard = ({
   link,
   shortlinkHidden,
   storePersonalLink = false,
   wholeCardLink = true
}) => {
   const hasData = useSelector(state => state.stuff[`Link:${link}`] != null);
   const { loggedInUserID } = useMe();

   const storedLinkData = useLinkData(link);

   const [refreshLink, { loading: refreshLoading }] = useMutation(
      REFRESH_LINK_MUTATION,
      {
         variables: {
            url: link
         },
         onError: err => alert(err.message)
      }
   );

   const { data, loading, error } = useQueryAndStoreIt(LINK_DATA_QUERY, {
      // const { data, loading, error } = useQuery(LINK_DATA_QUERY, {
      variables: {
         url: link,
         storePersonalLink
      },
      skip: (hasData && !refreshLoading) || link == null
   });

   console.log(data);

   if (link == null) return null;

   let computedData = storedLinkData;
   if (computedData == null && data != null) {
      computedData = data.getLinkData;
   }

   if (loading && !refreshLoading) {
      return (
         <StyledLinkCard>
            <div className="linkCardInfo icon">
               <div className="siteName">Loading...</div>
               <div className="description">Loading link data...</div>
            </div>
            <div className="linkCardLogo">
               <LoadingRing />
            </div>
         </StyledLinkCard>
      );
   }

   if (computedData != null) {
      const {
         id,
         ogURL,
         siteName,
         title,
         description,
         image,
         video,
         icon,
         updatedAt
      } = computedData;
      console.log(computedData);

      let computedURL = ogURL;
      if (computedURL == null) {
         computedURL = link;
      } else if (
         !computedURL.includes('http://') &&
         !computedURL.includes('https://') &&
         !computedURL.includes('ftp://')
      ) {
         computedURL = link;
      }

      let canBeUpdated = false;
      if (updatedAt == null) {
         canBeUpdated = true;
      } else {
         const now = new Date();
         const updatedAtDate = new Date(updatedAt);

         const updatedAgo = now.getTime() - updatedAtDate.getTime();
         if (updatedAgo > 1000 * 60 * 60 * 3) {
            canBeUpdated = true;
         }
      }

      if (
         siteName == null &&
         title == null &&
         image == null &&
         video == null &&
         description == null
      ) {
         if (shortlinkHidden) {
            return (
               <StyledLinkCard className="linkCard">
                  {canBeUpdated && loggedInUserID != null && (
                     <ResetIcon
                        className={
                           refreshLoading ? 'updateCard loading' : 'updateCard'
                        }
                        onClick={e => {
                           e.preventDefault();
                           refreshLink();
                        }}
                     />
                  )}
                  <ShortLink link={link} limit={80} />
               </StyledLinkCard>
            );
         }
         return null;
      }

      let trimmedDescription = description;
      const descriptionLengthLimit = 140;
      if (description != null && description.length > descriptionLengthLimit) {
         trimmedDescription = `${description
            .substring(0, descriptionLengthLimit)
            .trim()}...`;
      }

      let hasProperIcon = false;
      if (
         icon != null &&
         (icon.includes('http://') || icon.includes('https://'))
      ) {
         hasProperIcon = true;
      }
      // let hasProperIcon = true;
      // if (!icon.includes('http://') && !icon.includes('https://')) {
      //    hasProperIcon = false;
      // }

      const theLinkCard = (
         <>
            {canBeUpdated && loggedInUserID != null && (
               <ResetIcon
                  className={
                     refreshLoading ? 'updateCard loading' : 'updateCard'
                  }
                  onClick={e => {
                     e.preventDefault();
                     refreshLink();
                  }}
               />
            )}
            <div
               className={`linkCardInfo ${
                  image == null && video == null && hasProperIcon
                     ? 'icon'
                     : 'poster'
               }`}
            >
               <div className="siteName">
                  <a href={computedURL} target="_blank">
                     {siteName}
                  </a>
               </div>
               <a href={computedURL} target="_blank">
                  <div className="title">{title}</div>
               </a>
               <div className="description">{trimmedDescription}</div>
            </div>
            {image == null && video == null && icon != null && hasProperIcon && (
               <div className="linkCardLogo">
                  <img src={icon} />
               </div>
            )}
            {image != null && (
               <div className="linkCardPoster">
                  <img src={image} />
               </div>
            )}
         </>
      );

      if (wholeCardLink) {
         return (
            <StyledLinkCard
               className={`linkCard ${
                  image == null && video == null && icon != null
                     ? 'icon'
                     : 'poster'
               }`}
            >
               <a
                  href={computedURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wrapperLink"
               >
                  {theLinkCard}
               </a>
            </StyledLinkCard>
         );
      }
      return (
         <StyledLinkCard
            className={`linkCard titleLinkOnly ${
               image == null && video == null && icon != null
                  ? 'icon'
                  : 'poster'
            }`}
         >
            {theLinkCard}
         </StyledLinkCard>
      );
   }

   return null;
};

export default LinkCard;
