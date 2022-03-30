import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { minimumTranslationDistance } from '../../config';
import { getScrollingParent } from '../../Stickifier/useStickifier';
import { getOneRem, setLightness } from '../../styles/functions';
import ArrowIcon from '../Icons/Arrow';

const swipeThreshold = 75;

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
      --arrow-width: ${props => props.theme.smallText};
      svg.arrow {
         width: var(--arrow-width);
         margin: 0;
         cursor: pointer;
         rect {
            fill: ${props => setLightness(props.theme.mainText, 70)};
         }
         &.prev {
            margin-right: 0.5rem;
         }
         &.next {
            margin-left: 0.5rem;
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
   overridePosition = 0,
   onSwipe
}) => {
   // const [currentPosition, setCurrentPosition] = useState(overridePosition);

   const [positionObject, setPositionObject] = useState({
      position: overridePosition,
      direction: 'none'
   });
   const setCurrentPosition = position => {
      setPositionObject(prev => ({
         direction: prev.position > position ? 'right' : 'left',
         position
      }));
   };
   const setSwipeDirection = direction => {
      setPositionObject(prev => ({
         ...prev,
         direction
      }));
   };

   useEffect(() => {
      setPositionObject(prev => ({
         ...prev,
         position: overridePosition
      }));
   }, [overridePosition]);

   // I briefly experimented with blocking vertical scrolling while swiping. For some reason, this touchBlocker function would not work if I put a conditional in it, which meant I had to totally override the native scroll behavior, which would've been too much effort to do well, so I scrapped it.
   // const touchBlocker = e => {
   //    e.preventDefault();
   //    return false;
   // };

   // const swiperRef = useRef(null);

   // useEffect(() => {
   //    swiperRef.current.addEventListener('touchmove', touchBlocker, {
   //       passive: false
   //    });
   //    return () => {
   //       if (swiperRef.current != null) {
   //          swiperRef.current.removeEventListener('touchMove', touchBlocker);
   //       }
   //    };
   // });

   const animationRef = useRef('0px');

   const previousElementExists =
      elementsArray[positionObject.position - 1] != null;
   const nextElementExists = elementsArray[positionObject.position + 1] != null;

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

   const scrollToTop = e => {
      const scrollingParent = getScrollingParent(e.target);

      const contentElement = e.target.closest('.swiper');
      console.log(contentElement);

      const contentElementRect = contentElement.getBoundingClientRect();

      if (contentElementRect.top < 0) {
         let totalOffset = contentElement.offsetTop - scrollingParent.offsetTop;
         let parent = contentElement.offsetParent;
         while (parent != null && !parent.contains(scrollingParent)) {
            totalOffset += parent.offsetTop;
            parent = parent.offsetParent;
            console.log(parent);
         }

         const oneRem = getOneRem();

         console.log(totalOffset);
         scrollingParent.scrollTop = totalOffset - oneRem * 6;
      }
   };

   let initialAnimationPosition = '0px';
   if (positionObject.direction === 'right') {
      initialAnimationPosition = `calc(-100% + ${animationRef.current})`;
   } else if (positionObject.direction === 'left') {
      initialAnimationPosition = `calc(100% + ${animationRef.current})`;
   }

   const elements = (
      <div
         className="overflowWrapper"
         onTouchStart={e => {
            // e.stopPropagation();
            setTouchStart(e.touches[0].clientX);
            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchMove={e => {
            // e.stopPropagation();
            setTouchEnd(e.touches[0].clientX);
         }}
         onTouchEnd={e => {
            // e.stopPropagation();
            if (touchEnd - touchStart > swipeThreshold) {
               if (previousElementExists) {
                  setCurrentPosition(positionObject.position - 1);
                  setSwipeDirection('right');
                  scrollToTop(e);
                  if (onSwipe != null) {
                     onSwipe();
                  }
               }
            } else if (touchEnd - touchStart < swipeThreshold * -1) {
               if (nextElementExists) {
                  setCurrentPosition(positionObject.position + 1);
                  setSwipeDirection('left');
                  scrollToTop(e);
                  if (onSwipe != null) {
                     onSwipe();
                  }
               }
            }
            animationRef.current = `${calculatedTranslation}px`;
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
                  {elementsArray[positionObject.position - 1]}
               </div>
            )}
            <motion.div
               key={elementsArray[positionObject.position].key}
               initial={{
                  x: initialAnimationPosition
               }}
               animate={{ x: '0%' }}
               transition={{ duration: 0.1 }}
            >
               <div
                  className="currentElement"
                  style={{ transform: `translateX(${finalTranslation})` }}
               >
                  {elementsArray[positionObject.position]}
               </div>
            </motion.div>
            {nextElementExists && (
               <div
                  className={`nextElement ${
                     calculatedTranslation < 0 ? 'givesSize' : 'doesNotGiveSize'
                  }`}
                  style={{ transform: `translateX(${finalTranslation})` }}
               >
                  {elementsArray[positionObject.position + 1]}
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
               {positionObject.position > 0 && (
                  <ArrowIcon
                     className="prev"
                     onClick={e => {
                        setCurrentPosition(positionObject.position - 1);
                        scrollToTop(e);
                        if (onSwipe != null) {
                           onSwipe();
                        }
                     }}
                     pointing="left"
                  />
               )}
               <span
                  className={`sliderText${
                     positionObject.position === 0 ? ' noLeft' : ''
                  }${
                     positionObject.position + 1 === elementsArray.length
                        ? ' noRight'
                        : ''
                  }`}
               >
                  {positionObject.position + 1} / {elementsArray.length}
               </span>
               {positionObject.position + 1 < elementsArray.length && (
                  <ArrowIcon
                     className="next"
                     onClick={e => {
                        setCurrentPosition(positionObject.position + 1);
                        scrollToTop(e);
                        if (onSwipe != null) {
                           onSwipe();
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
