import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { linkFields } from '../lib/CardInterfaces';
import useQueryAndStoreIt from '../stuffStore/useQueryAndStoreIt';
import { setAlpha } from '../styles/functions';
import LoadingRing from './LoadingRing';

const LINK_DATA_QUERY = gql`
   query LINK_DATA_QUERY($url: String!) {
      getLinkData(url: $url) {
         ${linkFields}
      }
   }
`;

const StyledLinkCard = styled.div`
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
   padding: 1rem;
   display: flex;
   border-radius: 4px;
   margin-top: 0.5rem;
   &.poster {
      flex-wrap: wrap;
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
      ${props => props.theme.mobileBreakpoint} {
         width: 20rem;
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
      img {
         width: 100%;
         max-height: 32rem;
         object-fit: cover;
         object-position: center center;
      }
   }
`;

const useLinkData = link => useSelector(state => state.stuff[`Link:${link}`]);

const LinkCard = ({ link }) => {
   const hasData = useSelector(state => state.stuff[`Link:${link}`] != null);

   const storedLinkData = useLinkData(link);

   const { data, loading, error } = useQueryAndStoreIt(LINK_DATA_QUERY, {
      // const { data, loading, error } = useQuery(LINK_DATA_QUERY, {
      variables: {
         url: link
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

      if (
         siteName == null &&
         title == null &&
         image == null &&
         video == null &&
         description == null
      ) {
         return null;
      }

      let trimmedDescription = description;
      const descriptionLengthLimit = 140;
      if (description != null && description.length > descriptionLengthLimit) {
         trimmedDescription = `${description
            .substring(0, descriptionLengthLimit)
            .trim()}...`;
      }

      return (
         <StyledLinkCard
            className={`linkCard ${
               image == null && video == null && icon != null
                  ? 'icon'
                  : 'poster'
            }`}
         >
            <div
               className={`linkCardInfo ${
                  image == null && video == null && icon != null
                     ? 'icon'
                     : 'poster'
               }`}
            >
               <div className="siteName">
                  <a href={ogURL} target="_blank">
                     {siteName}
                  </a>
               </div>
               <div className="title">{title}</div>
               <div className="description">{trimmedDescription}</div>
            </div>
            {image == null && video == null && icon != null && (
               <div className="linkCardLogo">
                  <img src={icon} />
               </div>
            )}
            {image != null && video == null && (
               <div className="linkCardPoster">
                  <img src={image} />
               </div>
            )}
         </StyledLinkCard>
      );
   }

   return null;
};

export default LinkCard;
