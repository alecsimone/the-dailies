import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Taxes from './Taxes';
import { ThingContext } from '../../pages/thing';
import { setAlpha } from '../../styles/functions';
import TaxInput from './TaxInput';

const StyledTaxBox = styled.section`
   position: relative;
   max-width: 100%;
   padding: 0 1rem;
   margin: 2rem 0 3rem;
   ${props => props.theme.mobileBreakpoint} {
      padding: 0;
      margin: 0;
   }
   .taxboxContainer {
      display: inline-block;
      position: relative;
      margin-top: 0.8rem;
      z-index: 9;
      input {
         width: 30rem;
         position: relative;
         font-size: ${props => props.theme.smallText};
         line-height: 1;
         border-radius: 0;
      }
   }
`;

const TaxBox = ({ canEdit, personal, context }) => {
   // First we pull our tags out of context. A quick note here, for the other kind of context: Originally, I had two kinds of taxonomies: tags and stacks.
   // Tags were public, and anyone could add to them, stacks were personal and only you could add to them. So this component was designed to be generic to work for either kind. I've since gotten rid of stacks, so that's why that genericness seems unnecessary. But I always feel like I might add them back, or some other kind of taxonomy, so I'm not refactoring this component to not be generic.
   const { id, partOfTags: tags, partOfStacks: stacks } = useContext(
      context || ThingContext
   );

   return (
      <StyledTaxBox>
         <Taxes
            tags={tags}
            stacks={stacks}
            personal={personal}
            thingID={id}
            canEdit={canEdit}
         />
         {canEdit && (
            <TaxInput id={id} tags={tags} stacks={stacks} personal={personal} />
         )}
      </StyledTaxBox>
   );
};
TaxBox.propTypes = {
   canEdit: PropTypes.bool,
   personal: PropTypes.bool.isRequired
};

export default TaxBox;
