import Link from 'next/link';

const SmallThingCard = props => {
   const { data } = props;
   return (
      <article>
         <Link href={{ pathname: '/thing', query: { id: data.id } }}>
            <a>{data.title}</a>
         </Link>
      </article>
   );
};

export default SmallThingCard;
