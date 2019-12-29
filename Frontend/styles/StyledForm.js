import styled from 'styled-components';

const StyledForm = styled.form`
   max-width: 800px;
   margin: auto;
   height: auto;
   width: 100%;
   fieldset {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      width: 100%;
   }
   input {
      min-width: 60%;
      font-size: ${props => props.theme.smallText};
      width: 100%;
      margin: 1rem 0;
      padding: 0.75rem;
      border-radius: 3px;
      border: 1px solid ${props => props.theme.lowContrastGrey};
   }
   button {
      max-width: 200px;
      margin: 3rem auto 0;
      padding: 0.5rem 1rem;
      font-size: ${props => props.theme.smallText};
   }
`;

export default StyledForm;
