import styled from 'styled-components';
import { setAlpha, setSaturation } from '../../styles/functions';

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
   ${props => props.theme.mobileBreakpoint} {
      padding: 0 2rem;
   }
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
      position: relative;
      padding: 0 1rem;
      ${props => props.theme.mobileBreakpoint} {
         padding: 0;
      }
      input.collectionTitle,
      h3.collectionTitle {
         display: block;
         text-align: center;
         border: none;
         margin: 2rem auto calc(1.5rem + 1px);
         font-size: ${props => props.theme.smallHead};
         font-weight: bold;
         max-width: 100%;
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
         flex-wrap: wrap;
         ${props => props.theme.mobileBreakpoint} {
            flex-wrap: nowrap;
         }
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
               margin: 0 3rem 2rem;
               ${props => props.theme.mobileBreakpoint} {
                  margin: 0 3rem;
               }
            }
         }
         .headerButtons {
            display: flex;
            align-items: center;
            > * {
               background: ${props => setAlpha(props.theme.lightBlack, 0.8)};
               border: 1px solid
                  ${props => setAlpha(props.theme.mainText, 0.25)};
            }
            button {
               font-size: ${props => props.theme.smallText};
               padding: 0.5rem;
               opacity: 0.8;
               margin-left: 2rem;
               &:hover {
                  opacity: 1;
               }
            }
            svg {
               height: ${props => props.theme.smallHead};
               margin-left: 1.5rem;
               cursor: pointer;
               padding: 0.5rem 1rem;
               border-radius: 4px;
               > * {
                  opacity: 0.8;
               }
               &:hover {
                  > * {
                     opacity: 1;
                  }
               }
            }
         }
      }
      .privacyInterfaceWrapper {
         text-align: center;
         margin-top: 1rem;
         position: absolute;
         z-index: 2;
         right: 0;
         width: 60rem;
         max-width: 40%;
         .privacyInterface {
            width: 100%;
            display: inline-block;
            padding: 2rem 4rem;
            background: ${props => props.theme.lightBlack};
            border: 2px solid ${props => props.theme.lowContrastGrey};
            border-radius: 3px;
            box-shadow: 0 0 3px black;
            .privacySelectorGroup {
               span {
                  margin-right: 2rem;
               }
            }
            input {
               display: block;
               font-size: ${props => props.theme.smallText};
               width: 100%;
            }
            .addPeopleBox {
               .permissionLine {
                  margin: 2rem 0;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  .existingCount {
                     width: 15rem;
                     cursor: pointer;
                  }
                  .searchBox {
                     position: relative;
                     width: 100%;
                     flex-grow: 1;
                     .searchResults {
                        z-index: 2;
                        position: absolute;
                        width: 100%;
                        top: 100%;
                        background: ${props => props.theme.lightBlack};
                        .memberSearchResult {
                           padding: 1rem 0;
                           border: 1px solid
                              ${props => props.theme.lowContrastGrey};
                           cursor: pointer;
                           &.highlighted,
                           &:hover {
                              background: ${props => props.theme.majorColor};
                           }
                           &:last-child {
                              border-bottom: 2px solid
                                 ${props => props.theme.lowContrastGrey};
                           }
                        }
                     }
                  }
               }
               .extraPerson {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 1rem 0;
                  svg {
                     height: ${props => props.theme.smallText};
                     margin-left: 2rem;
                     padding-top: 3px;
                     opacity: 0.6;
                     cursor: pointer;
                     &:hover {
                        opacity: 0.85;
                     }
                  }
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
         flex-wrap: wrap;
         width: 100%;
         ${props => props.theme.mobileBreakpoint} {
            flex-wrap: nowrap;
            width: auto;
            margin-left: -2rem;
         }
         .column {
            max-width: 64rem;
            ${props => props.theme.mobileBreakpoint} {
               padding-left: 2rem;
            }
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
   display: inline-block;
   padding: 0 1rem;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0 2rem;
   }
   border-radius: 6px;
   margin-bottom: 2rem;
   background: ${props => setAlpha(props.theme.lightBlack, 0.8)};
   &.blankGroup {
      padding: 2rem;
      text-align: center;
   }
   header.groupHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0;
      h4.groupTitle,
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
         svg {
            cursor: pointer;
            height: ${props => props.theme.smallText};
            opacity: 0.4;
            transition: all 0.2s;
            flex-grow: 1;
            &:hover {
               opacity: 0.8;
               transform: scale(1.1);
            }
            &:last-child {
               margin-left: 2rem;
            }
         }
      }
   }
   .blankSpace {
      background: ${props => props.theme.midBlack};
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
   }
   footer.collectionsGroupFooter {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1.5rem 0 2rem;
      ${props => props.theme.mobileBreakpoint} {
         margin-top: 0;
      }
      .thingSearchInput {
         width: 40rem;
         position: relative;
         flex-grow: 1;
         .postSearchResults {
            background: ${props => props.theme.lightBlack};
            position: absolute;
            width: 100%;
            .noResults,
            .searchingPosts {
               padding: 2rem;
               text-align: center;
            }
         }
      }
      input {
         width: 40rem;
         flex-grow: 1;
         font-size: ${props => props.theme.smallText};
      }
      .buttons {
         margin-left: 3rem;
         padding-top: 1rem;
         display: flex;
         align-items: center;
         svg {
            width: ${props => props.theme.bigText};
            height: auto;
            cursor: pointer;
            &.linkIcon {
               path {
                  fill: ${props => props.theme.lowContrastGrey};
               }
            }
         }
         .contentIconWrapper {
            margin-left: 2rem;
            line-height: 0;
            position: relative;
            cursor: pointer;
            .badge {
               position: absolute;
               right: 0;
               bottom: calc(${props => props.theme.miniText} * -0.25);
               right: calc(${props => props.theme.miniText} * -0.25);
               border-radius: 100%;
               background: ${props =>
                  setSaturation(props.theme.majorColor, 50)};
               font-size: ${props => props.theme.miniText};
               height: ${props => props.theme.miniText};
               width: ${props => props.theme.miniText};
               text-align: center;
               line-height: 1;
            }
         }
      }
   }
`;
export { StyledGroup };

const StyledCard = styled.div`
   ${props => props.theme.mobileBreakpoint} {
      margin-bottom: 2rem;
   }
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
   .linkCard {
      margin-top: 0;
      border: none;
      border-bottom: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
   }
   &.noEdit {
      .linkCard {
         border-bottom: none;
      }
      article {
         border-bottom: none;
      }
   }
   .cardManagementBar {
      display: flex;
      justify-content: space-between;
      &.noCopy {
         justify-content: flex-end;
      }
      align-items: center;
      font-size: ${props => props.theme.miniText};
      padding: 1.5rem 1rem;
      line-height: 1;
      svg.x {
         height: ${props => props.theme.smallText};
         opacity: 0.4;
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

const StyledNote = styled.div`
   margin-bottom: 2rem;
   background: ${props => props.theme.midBlack};
   width: 100%;
   .postButtonWrapper {
      display: flex;
      justify-content: space-between;
      padding: 0 1.5rem;
      margin: 1rem 0;
      button.post {
         padding: 0.6rem;
         font-size: ${props => props.theme.smallText};
         font-weight: 500;
         background: ${props => setAlpha(props.theme.majorColor, 0.8)};
      }
   }
   .textWrapper {
      padding: 1rem;
      border-bottom: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
      white-space: pre-wrap;
   }
   textarea {
      width: 100%;
      height: 6.5rem;
      border: none;
      resize: none;
      border-bottom: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
   }
   footer {
      display: flex;
      justify-content: flex-end;
      padding: 1rem;
      svg {
         height: ${props => props.theme.smallHead};
         opacity: 0.4;
         padding: 0.5rem;
         cursor: pointer;
         &:hover {
            opacity: 0.8;
         }
         &.x {
            margin-left: 1.5rem;
         }
      }
   }
`;
export { StyledNote };
