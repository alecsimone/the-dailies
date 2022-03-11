import styled from 'styled-components';
import { setAlpha } from '../../styles/functions';

const StyledNoCollections = styled.section`
   margin-top: 6rem;
   text-align: center;
   button {
      padding: 1rem;
      font-size: ${props => props.theme.bigText};
      margin-top: 3rem;
   }
`;
export { StyledNoCollections };

const StyledCollection = styled.section`
   padding: 0 2rem;
   &.loadingCollection {
      .explanation {
         text-align: center;
         font-size: ${props => props.theme.smallHead};
         font-weight: bold;
         margin: 2rem auto 3rem;
         line-height: normal;
      }
   }
   header {
      margin-bottom: 2rem;
      input.collectionTitle {
         display: block;
         text-align: center;
         border: none;
         margin: 2rem auto calc(1.5rem + 1px);
         font-size: ${props => props.theme.smallHead};
         font-weight: bold;
         &:focus {
            border-bottom: 1px solid ${props => props.theme.mainText};
            outline: none;
            margin-bottom: 1.5rem;
         }
      }
      .headerOptions {
         margin-top: 1rem;
         display: flex;
         justify-content: space-between;
         align-items: center;
         .left {
            display: flex;
            align-items: center;
            flex-grow: 1;
            select {
               padding: 0.5rem;
               padding-right: 4rem;
            }
            .loadingPlaceholder {
               border: 1px solid ${props => props.theme.lowContrastGrey};
               border-radius: 3px;
               color: ${props => props.theme.mainText};
               line-height: normal;
               font-weight: 400;
               padding: 0.5rem calc(0.5rem + 4px); // On firefox at least, the browser adds 4px of padding to the left of an option, which seems to extend the padding on the select. So I added 4px here to make it match a bit better
            }
            input {
               font-size: ${props => props.theme.smallText};
               text-align: center;
               flex-grow: 1;
               max-width: 48rem;
               margin: 0 3rem;
            }
         }
         .headerButtons {
            button {
               font-size: ${props => props.theme.smallText};
               padding: 0.5rem;
               opacity: 0.8;
               margin-left: 2rem;
               &:hover {
                  opacity: 1;
               }
            }
         }
      }
   }
   .collectionBody {
      button.more {
         font-size: ${props => props.theme.bigText};
         padding: 0.5rem 1rem;
         display: block;
         margin: 3rem auto;
      }
      .masonryContainer {
         display: flex;
         width: auto;
         margin-left: -2rem;
         .column {
            padding-left: 2rem;
            flex-grow: 1;
            .dragging {
               background: ${props => setAlpha(props.theme.lightBlack, 0.6)};
            }
            .dragging,
            .notDragging {
               border-radius: 6px;
            }
         }
         .smallThingCard {
            max-width: none;
            opacity: 1;
         }
      }
   }
`;
export { StyledCollection };

const StyledGroup = styled.div`
   width: 100%;
   max-width: 64rem;
   display: inline-block;
   padding: 0 2rem;
   border-radius: 6px;
   margin-bottom: 2rem;
   background: ${props => setAlpha(props.theme.lightBlack, 0.8)};
   &.blankGroup {
      padding: 2rem;
      text-align: center;
   }
   header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0;
      h3,
      input.groupTitle {
         font-size: ${props => props.theme.bigText};
         font-weight: bold;
         margin: 1.5rem 0;
         width: 1px;
         flex-grow: 1;
         margin-right: 1rem;
      }
      input.groupTitle {
         border: none;
         margin-bottom: calc(1.5rem + 1px);
         &:focus {
            border-bottom: 1px solid ${props => props.theme.mainText};
            outline: none;
            margin-bottom: 1.5rem;
         }
      }
      .buttons {
         display: flex;
         align-items: center;
         button {
            padding: 0.5rem 1rem;
            font-size: ${props => props.theme.smallText};
            border-radius: 6px;
         }
         svg.x {
            cursor: pointer;
            height: calc(${props => props.theme.smallText} + 1rem);
            opacity: 0.6;
            transition: all 0.2s;
            &:hover {
               opacity: 1;
               transform: scale(1.1);
            }
            margin-left: 2rem;
         }
      }
   }
   .blankSpace {
      background: ${props => props.theme.midBlack};
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
   }
   footer {
      input {
         width: 40rem;
         font-size: ${props => props.theme.smallText};
         margin-bottom: 2rem;
      }
   }
`;
export { StyledGroup };

const StyledCard = styled.div`
   margin-bottom: 2rem;
   background: ${props => props.theme.midBlack};
   width: 100%;
   article {
      width: 100%;
      border-right: none;
      border-left: none;
      max-width: none;
      header {
         display: block;
      }
      &.smallThingCard {
         opacity: 1;
      }
   }
   img {
      width: 100%;
   }
   .cardManagementBar {
      display: flex;
      justify-content: space-between;
      &.noCopy {
         justify-content: flex-end;
      }
      align-items: center;
      font-size: ${props => props.theme.miniText};
      padding: 1rem;
      line-height: 1;
      svg.x {
         height: ${props => props.theme.smallHead};
         opacity: 0.4;
         padding: 0.5rem;
         cursor: pointer;
         &:hover {
            opacity: 0.8;
         }
      }
      .copyInterface {
         display: flex;
         align-items: center;
         select {
            padding: 0.5rem;
            padding-right: 4rem;
            margin-left: 2rem;
            font-size: ${props => props.theme.miniText};
            cursor: pointer;
         }
         option {
         }
      }
   }
`;
export { StyledCard };
