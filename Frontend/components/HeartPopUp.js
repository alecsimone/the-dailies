import { useContext } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import HeartIcon from './Icons/Heart';
import { ModalContext } from './ModalProvider';
import { getOneRem } from '../styles/functions';

const StyledHeart = styled.div`
   position: fixed;
   width: ${props => props.theme.smallHead};
   height: ${props => props.theme.smallHead};
   z-index: 2;
   &.full {
      .heartIcon {
         fill: ${props => props.theme.warning};
         stroke: ${props => props.theme.warning};
      }
   }
   &.empty {
      .heartIcon {
         fill: ${props => props.theme.deepBlack};
         stroke: ${props => props.theme.lowContrastGrey};
      }
   }
`;

const HeartPopUp = () => {
   const { heartPosition, setHeartPosition, fullHeart } = useContext(
      ModalContext
   );

   let oneRem;
   if (process.browser) {
      oneRem = getOneRem();
      window.setTimeout(() => setHeartPosition(false), 500);
   }

   const exitMotion = fullHeart ? -40 : 40;

   return (
      <StyledHeart
         style={{
            left: heartPosition[0] - 2 * oneRem,
            top: heartPosition[1] - 2 * oneRem
         }}
         className={fullHeart ? 'full' : 'empty'}
      >
         <AnimatePresence>
            {heartPosition !== false && (
               <motion.div
                  key="heart"
                  initial={{ scale: 3 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  exit={{ opacity: 0, y: exitMotion, scale: 2, duration: 0.4 }}
               >
                  <HeartIcon />
               </motion.div>
            )}
         </AnimatePresence>
      </StyledHeart>
   );
};

export default HeartPopUp;
