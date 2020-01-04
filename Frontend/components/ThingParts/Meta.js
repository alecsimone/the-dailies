import { useContext } from 'react';
import { ThingContext } from '../../pages/thing';

const Meta = () => {
   const { partOfTags: tags, partOfCategory: category } = useContext(
      ThingContext
   );
   const tagElements = tags.map((tag, index) => {
      if (index < tags.length - 1)
         return (
            <span key={tag.id}>
               <a>{tag.title}</a>,{' '}
            </span>
         );
      return <a key={tag.id}>{tag.title}</a>;
   });

   return (
      <section>
         <div className="tags">{tagElements}</div>
         <div className="category">{category.title}</div>
      </section>
   );
};

export default Meta;
