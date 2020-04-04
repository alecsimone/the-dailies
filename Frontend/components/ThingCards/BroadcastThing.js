import { useContext } from 'react';
import styled from 'styled-components';
import { ThingContext } from '../../pages/thing';
import { disabledCodewords } from '../../lib/ThingHandling';
import Content from '../ThingParts/Content';
import { setAlpha, setLightness } from '../../styles/functions';
import ExplodingLink from '../ExplodingLink';

const StyledBroadcastThing = styled.article`
   background: ${props => props.theme.midBlack};
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   margin: 2rem;
   padding: 0;
   position: relative;
   height: 100%;
   max-height: calc(100% - 4rem);
   overflow: hidden;
   display: grid;
   grid-template-rows: auto 1fr;
   h2.thingTitle {
      text-align: center;
      font-size: ${props => props.theme.bigHead};
      font-weight: 600;
      line-height: 1.4;
      margin: 0;
      padding: 2rem;
      background: ${props => setAlpha(props.theme.deepBlack, 0.8)};
      border-bottom: 1px solid
         ${props => setLightness(props.theme.lowContrastGrey, 15)};
   }
   .broadcastBody {
      display: flex;
      position: relative;
      max-height: 100%;
      overflow: hidden;
      font-size: 3.5rem;
      .left {
         padding: 0 2rem;
         flex-basis: 35%;
         background: ${props => setAlpha(props.theme.lightBlack, 0.6)};
         display: flex;
         align-items: center;
         border-right: 4px solid ${props => props.theme.deepBlack};
         a {
            width: 100%;
         }
         img {
            width: 100%;
            object-fit: contain;
         }
         &.featuredTweet {
            max-height: 100%;
            display: block;
            ${props => props.theme.scroll};
         }
         .embed-container {
            width: 100%;
            height: 90%;
         }
      }
      .right {
         flex-grow: 1;
         flex-basis: 65%;
         max-height: 100%;
         padding: 2rem;
         ${props => props.theme.scroll};
         .content {
            /* max-height: 100%; */
            max-width: 1440px;
            background: none;
            border: none;
            margin: 0 auto;
         }
      }
   }
`;

const BroadcastThing = ({ id }) => {
   const { title, featuredImage, content } = useContext(ThingContext);
   console.log(title);

   let featuredImageElement;
   let featuredTweet = false;
   if (
      featuredImage != null &&
      !disabledCodewords.includes(featuredImage.toLowerCase())
   ) {
      featuredImageElement = (
         <ExplodingLink
            url={featuredImage}
            alt="Featured"
            className="featured"
         />
      );

      if (
         featuredImage.toLowerCase().includes('twitter.com/') &&
         featuredImage.toLowerCase().includes('/status/')
      ) {
         featuredTweet = true;
      }
   }
   return (
      <StyledBroadcastThing>
         <h2 className="thingTitle">{title}</h2>
         <div className="broadcastBody">
            {featuredImageElement && (
               <div className={featuredTweet ? 'left featuredTweet' : 'left'}>
                  {featuredImageElement}
               </div>
            )}
            <div className="right">
               <Content
                  context={ThingContext}
                  key={`${id}-Content`}
                  canEdit={false}
               />
            </div>
         </div>
      </StyledBroadcastThing>
   );
};

export default BroadcastThing;
