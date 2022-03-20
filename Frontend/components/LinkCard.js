import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { linkFields } from '../lib/CardInterfaces';
import useQueryAndStoreIt from '../stuffStore/useQueryAndStoreIt';
import { setAlpha, setLightness } from '../styles/functions';
import LoadingRing from './LoadingRing';
import ShortLink from './ThingParts/ShortLink';

const LINK_DATA_QUERY = gql`
   query LINK_DATA_QUERY($url: String!, $storePersonalLink: Boolean) {
      getLinkData(url: $url, storePersonalLink: $storePersonalLink) {
         ${linkFields}
      }
   }
`;

const StyledLinkCard = styled.div`
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
   padding: 1rem;
   border-radius: 4px;
   margin-top: 0.5rem;
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

const LinkCard = ({ link, shortlinkHidden, storePersonalLink = false }) => {
   const hasData = useSelector(state => state.stuff[`Link:${link}`] != null);

   const storedLinkData = useLinkData(link);

   const { data, loading, error } = useQueryAndStoreIt(LINK_DATA_QUERY, {
      // const { data, loading, error } = useQuery(LINK_DATA_QUERY, {
      variables: {
         url: link,
         storePersonalLink
      },
      skip: hasData || link == null
   });

   if (link == null) return null;

   let computedData = storedLinkData;
   if (computedData == null && data != null) {
      computedData = data.getLinkData;
   }

   if (loading) {
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
         ogURL,
         siteName,
         title,
         description,
         image,
         video,
         icon
      } = computedData;

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
                  <div className="title">{title}</div>
                  <div className="description">{trimmedDescription}</div>
               </div>
               {image == null &&
                  video == null &&
                  icon != null &&
                  hasProperIcon && (
                     <div className="linkCardLogo">
                        <img src={icon} />
                     </div>
                  )}
               {image != null && (
                  <div className="linkCardPoster">
                     <img src={image} />
                  </div>
               )}
            </a>
         </StyledLinkCard>
      );
   }

   return null;
};

export default LinkCard;
