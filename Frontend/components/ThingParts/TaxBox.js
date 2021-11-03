import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Taxes from './Taxes';
import TaxInput from './TaxInput';

const useTaxBoxData = thingID =>
   useSelector(state => state.things[thingID].partOfTags);

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

const TaxBox = ({ canEdit, personal, id }) => {
   const tags = useTaxBoxData(id);
   return (
      // A quick note here, for context: Originally, I had two kinds of taxonomies: tags and stacks.
      // Tags were public, and anyone could add to them, stacks were personal and only you could add to them. So this component was designed to be generic to work for either kind. I've since gotten rid of stacks, so that's why that genericness seems unnecessary. But I always feel like I might add them back, or some other kind of taxonomy, so I'm not refactoring this component to not be generic.
      <StyledTaxBox className="taxBox">
         <Taxes
            tags={tags}
            personal={personal}
            thingID={id}
            canEdit={canEdit}
         />
         {canEdit && <TaxInput id={id} tags={tags} personal={personal} />}
      </StyledTaxBox>
   );
};
TaxBox.propTypes = {
   canEdit: PropTypes.bool,
   personal: PropTypes.bool.isRequired
};

export default React.memo(TaxBox);
