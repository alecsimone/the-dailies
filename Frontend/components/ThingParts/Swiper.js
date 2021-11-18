import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { minimumTranslationDistance } from '../../config';
import { getScrollingParent } from '../../Stickifier/useStickifier';
import { getOneRem, setLightness } from '../../styles/functions';
import ArrowIcon from '../Icons/Arrow';

const swipeThreshold = 100;

const StyledSwiper = styled.div`
   margin: 2rem 0;
   .overflowWrapper {
      width: 100%;
      overflow: hidden;
      .elementsContainer {
         width: 300%;
         > * {
            display: inline-block;
            width: 33.33%;
         }
         .doesNotGiveSize {
            height: 0;
            overflow-y: hidden;
         }
         .givesSize {
            height: auto;
         }
      }
   }
   .navigator {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 1rem;
      --arrow-width: ${props => props.theme.bigText};
      svg.arrow {
         width: var(--arrow-width);
         margin: 0;
         cursor: pointer;
         rect {
            fill: ${props => setLightness(props.theme.mainText, 70)};
         }
         &:hover {
            rect {
               fill: ${props => props.theme.mainText};
            }
         }
      }
      span.sliderText {
         &.noLeft {
            margin-left: var(--arrow-width);
         }
         &.noRight {
            margin-right: var(--arrow-width);
         }
      }
   }
`;

const Swiper = ({
   elementsArray = [],
   hideNavigator,
   overridePosition = 0
}) => {
   const [currentPosition, setCurrentPosition] = useState(overridePosition);

   useEffect(() => {
      setCurrentPosition(overridePosition);
   }, [overridePosition]);

   const previousElementExists = elementsArray[currentPosition - 1] != null;
   const nextElementExists = elementsArray[currentPosition + 1] != null;

   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);

   let initialTranslationAmount = -100;
   if (!previousElementExists) {
      initialTranslationAmount = 0;
   }

   let calculatedTranslation = touchEnd - touchStart;
   if (!previousElementExists) {
      if (calculatedTranslation > 0) {
         calculatedTranslation = 0;
      }
   }
   if (!nextElementExists) {
      if (calculatedTranslation < 0) {
         calculatedTranslation = 0;
      }
   }
   if (
      calculatedTranslation > minimumTranslationDistance * -1 &&
      calculatedTranslation < minimumTranslationDistance
   ) {
      calculatedTranslation = 0;
   }

   const finalTranslation = `calc(${initialTranslationAmount}% + ${calculatedTranslation}px)`;

   const elements = (
      <div
         className="overflowWrapper"
         onTouchStart={e => {
            setTouchStart(e.touches[0].clientX);
            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchMove={e => setTouchEnd(e.touches[0].clientX)}
         onTouchEnd={e => {
            if (touchEnd - touchStart > swipeThreshold) {
               if (previousElementExists) {
                  setCurrentPosition(currentPosition - 1);
               }
            } else if (touchEnd - touchStart < swipeThreshold * -1) {
               if (nextElementExists) {
                  setCurrentPosition(currentPosition + 1);
               }
            }
            setTouchStart(0);
            setTouchEnd(0);
         }}
      >
         <div className="elementsContainer">
            {previousElementExists && (
               <div
                  className={`previousElement ${
                     calculatedTranslation > 0 ? 'givesSize' : 'doesNotGiveSize'
                  }`}
                  style={{ transform: `translateX(${finalTranslation})` }}
               >
                  {elementsArray[currentPosition - 1]}
               </div>
            )}
            <div
               className="currentElement"
               style={{ transform: `translateX(${finalTranslation})` }}
            >
               {elementsArray[currentPosition]}
            </div>
            {nextElementExists && (
               <div
                  className={`nextElement ${
                     calculatedTranslation < 0 ? 'givesSize' : 'doesNotGiveSize'
                  }`}
                  style={{ transform: `translateX(${finalTranslation})` }}
               >
                  {elementsArray[currentPosition + 1]}
               </div>
            )}
         </div>
      </div>
   );

   return (
      <StyledSwiper className="swiper">
         {elements}
         {elementsArray.length > 1 && !hideNavigator && (
            <div className="navigator">
               {currentPosition > 0 && (
                  <ArrowIcon
                     onClick={e => {
                        setCurrentPosition(currentPosition - 1);
                        const scrollingParent = getScrollingParent(e.target);

                        const contentElement = e.target.closest('.swiper');

                        const contentElementRect = contentElement.getBoundingClientRect();
                        console.log(contentElementRect.top);

                        if (contentElementRect.top < 0) {
                           let totalOffset = contentElement.offsetTop;
                           let parent = contentElement.offsetParent;
                           while (parent != null) {
                              totalOffset += parent.offsetTop;
                              parent = parent.offsetParent;
                           }

                           const oneRem = getOneRem();

                           scrollingParent.scrollTop =
                              totalOffset - oneRem * 10;
                        }
                     }}
                     pointing="left"
                  />
               )}
               <span
                  className={`sliderText${
                     currentPosition === 0 ? ' noLeft' : ''
                  }${
                     currentPosition + 1 === elementsArray.length
                        ? ' noRight'
                        : ''
                  }`}
               >
                  {currentPosition + 1} / {elementsArray.length}
               </span>
               {currentPosition + 1 < elementsArray.length && (
                  <ArrowIcon
                     onClick={e => {
                        setCurrentPosition(currentPosition + 1);
                        const scrollingParent = getScrollingParent(e.target);

                        const contentElement = e.target.closest('.swiper');

                        const contentElementRect = contentElement.getBoundingClientRect();

                        if (contentElementRect.top < 0) {
                           let totalOffset = contentElement.offsetTop;
                           let parent = contentElement.offsetParent;
                           while (parent != null) {
                              totalOffset += parent.offsetTop;
                              parent = parent.offsetParent;
                           }

                           const oneRem = getOneRem();

                           scrollingParent.scrollTop =
                              totalOffset - oneRem * 10;
                        }
                     }}
                     pointing="right"
                  />
               )}
            </div>
         )}
      </StyledSwiper>
   );
};

export default Swiper;
