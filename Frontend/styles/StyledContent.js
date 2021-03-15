import styled from 'styled-components';
import { setAlpha, setLightness } from './functions';

const StyledContent = styled.section`
   margin: 0 0 3rem;
   padding-top: 0;
   ${props => props.theme.mobileBreakpoint} {
      margin: 5rem 0;
      padding: 1rem 2rem;
      padding-top: 0;
   }
   .contentSectionWrapper {
      padding: 1rem;
      background: ${props => props.theme.midBlack};
      border-top: 1px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      ${props => props.theme.mobileBreakpoint} {
         border: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         border-radius: 0.5rem;
      }
      ${props => props.theme.midScreenBreakpoint} {
         padding: 0;
      }
      .contentBlock {
         position: relative;
         padding: 0;
         margin: 0.6rem 0;
         border-bottom: 1px solid
            ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
         ${props => props.theme.mobileBreakpoint} {
            padding: 1rem;
         }
         ${props => props.theme.desktopBreakpoint} {
            display: flex;
            align-items: flex-start;
            padding: 2rem 3rem;
         }
         &.highlighted {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.2)};
         }
         .contentArea {
            width: 100%;
            .contentPiece {
               margin: 0rem 0;
               flex-grow: 1;
               width: 100%;
               white-space: pre-wrap;
               padding: 0.5rem;
               ${props => props.theme.mobileBreakpoint} {
                  padding: 2rem;
               }
               ${props => props.theme.midScreenBreakpoint} {
                  height: 100%;
                  padding: 0;
               }
               .overflowWrapper {
                  width: 100%;
                  overflow: hidden;
                  ${props => props.theme.midScreenBreakpoint} {
                     overflow: visible;
                  }
                  .contentAndCommentContainer {
                     width: calc(200% + 1rem);
                     display: flex;
                     ${props => props.theme.midScreenBreakpoint} {
                        width: 100%;
                     }
                     .contentWrapper,
                     .commentsWrapper {
                        display: inline-block;
                        width: 50%;
                        min-height: 15rem;
                     }
                     .contentWrapper {
                        margin-right: 2rem;
                        z-index: 2;
                        ${props => props.theme.midScreenBreakpoint} {
                           max-width: 60%;
                           min-width: 60%;
                           border-right: 1px solid
                              ${props =>
                                 setAlpha(props.theme.lowContrastGrey, 0.2)};
                           padding-right: calc(
                              ${props => props.theme.smallText} + 2rem
                           );
                           margin-right: 0;
                        }
                        .theActualContent {
                           max-width: 900px;
                           width: calc(100% - 4rem);
                           form {
                              margin: 0 auto;
                           }
                        }
                     }
                     .commentsWrapper {
                        ${props => props.theme.midScreenBreakpoint} {
                           width: 40%;
                        }
                        &.noComments {
                           ${props => props.theme.midScreenBreakpoint} {
                              display: none;
                           }
                        }
                        .commentsArea {
                           width: calc(100% - 4rem);
                           ${props => props.theme.midScreenBreakpoint} {
                              width: 100%;
                           }
                           &.collapsed {
                              transition: opacity 0.25s ease-out;
                              &:hover {
                                 opacity: 1;
                              }
                           }
                           textarea {
                              padding: 1rem;
                              min-height: 6rem;
                           }
                        }
                        div.contentButtons {
                           ${props => props.theme.midScreenBreakpoint} {
                              display: none;
                           }
                        }
                     }
                     .givesSize {
                        height: auto;
                     }
                     .doesNotGiveSize {
                        height: 0;
                        ${props => props.theme.midScreenBreakpoint} {
                           height: auto;
                        }
                     }
                     img,
                     video,
                     iframe {
                        max-width: 100%;
                     }
                     iframe {
                        width: 100%;
                     }
                     .smallThingCard {
                        margin: 2rem 0;
                     }
                     .regularThingCard {
                        border: 1px solid
                           ${props =>
                              setAlpha(props.theme.lowContrastGrey, 0.25)};
                     }
                     .tweet.threadStarter {
                        margin-bottom: 0;
                        .quoteTweetContainer {
                           margin-top: 0;
                           margin-bottom: 0;
                        }
                     }
                     svg.arrow {
                        width: ${props => props.theme.bigHead};
                        cursor: pointer;
                        margin: auto;
                        display: block;
                        rect {
                           fill: ${props =>
                              setLightness(props.theme.mainText, 70)};
                        }
                        &:hover {
                           rect {
                              fill: ${props => props.theme.mainText};
                           }
                        }
                     }
                     .contentSlider svg.arrow {
                        margin: 0; /* need this here because I'm not sure how to make the svg.arrow on ThingCards more specific from within them */
                     }
                  }
               }
            }
            div.contentButtons {
               width: ${props => props.theme.smallText};
               position: absolute;
               bottom: 1rem;
               right: 0;
               display: flex;
               flex-direction: column;
               justify-content: space-between;
               &.allButtons {
                  min-height: 200px;
                  max-height: 240px;
               }
               &.someButtons {
                  min-height: 80px;
                  max-height: 140px;
               }
               ${props => props.theme.midScreenBreakpoint} {
                  right: 1rem;
               }
               .commentButtonWrapper {
                  margin-bottom: 0;
               }
               .addToContainer {
                  position: relative;
                  line-height: 0;
                  .addToInterface {
                     line-height: 1.6;
                  }
               }
               svg.buttons {
                  width: 100%;
                  &.trashIcon {
                     opacity: 0.8;
                  }
                  &.unlink {
                     opacity: 0.6;
                  }
                  &.addTo {
                     opacity: 0.4;
                     transform: rotate(45deg);
                     &.open {
                        transform: rotate(0deg);
                     }
                  }
                  &.editThis {
                     opacity: 0.4;
                     cursor: pointer;
                  }
                  &.reorder {
                     opacity: 0.4;
                     &.reordering {
                        opacity: 1;
                        &:hover {
                           opacity: 0.4;
                        }
                     }
                  }
                  &.directLink {
                     opacity: 0.4;
                  }
                  &:hover {
                     cursor: pointer;
                     opacity: 1;
                  }
               }
            }
            .otherLocations {
               font-size: ${props => props.theme.miniText};
               text-align: center;
               border-top: 1px solid
                  ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
               max-width: 80%;
               margin: auto;
               padding: 1rem 0;
               ${props => props.theme.midScreenBreakpoint} {
                  padding: 1rem 0 0;
               }
               .basicInfo {
                  a {
                     cursor: pointer;
                  }
               }
            }
            .votebar {
               width: calc(100% - 4rem);
               margin: 0 0 1rem 0;
               max-width: 900px;
               &.mini {
                  margin: 0;
               }
            }
         }
      }
      button.reorder {
         display: block;
         position: relative;
         z-index: 0;
         margin: 0 auto 1rem;
         opacity: 0.4;
         font-weight: 300;
         &:hover {
            opacity: 1;
         }
      }
      .reordering {
         background: ${props => setAlpha(props.theme.lowContrastGrey, 0.1)};
         cursor: pointer;
         border-radius: 3px;
      }
      .placeholder {
         background: ${props => props.theme.majorColor};
         color: ${props => props.theme.majorColor};
      }
      .dragged {
         background: ${props => props.theme.lowContrastGrey};
         border: 2px solid
            ${props => setAlpha(props.theme.highContrastGrey, 0.6)};
         user-select: none;
      }
   }
   form {
      display: flex;
      flex-wrap: wrap;
      max-width: 900px;
      margin: 4rem auto 0;
      .postButtonWrapper {
         width: 100%;
         /* text-align: right; */
         display: flex;
         justify-content: space-between;
      }
   }
   textarea {
      width: 100%;
      position: relative;
      height: calc(5rem + 4px);
   }
   button {
      margin: 1rem 0;
      padding: 0.6rem;
      font-size: ${props => props.theme.smallText};
      font-weight: 500;
      &.post {
         background: ${props => setAlpha(props.theme.majorColor, 0.8)};
         color: ${props => props.theme.mainText};
         &:hover {
            background: ${props => props.theme.majorColor};
            box-shadow: 0 0 6px
               ${props => setAlpha(props.theme.majorColor, 0.6)};
         }
      }
   }
`;

export default StyledContent;
