import Link from 'next/link';

const AuthorLink = props => {
   const { author } = props;
   return (
      <Link href={{ pathname: '/member', query: { id: author.id } }}>
         <a className="authorLink">{author.displayName}</a>
      </Link>
   );
};

export default AuthorLink;
