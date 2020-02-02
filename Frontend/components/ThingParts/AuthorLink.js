import Link from 'next/link';
import PropTypes from 'prop-types';

const AuthorLink = props => {
   const { author } = props;
   if (!author) {
      return null;
   }
   return (
      <Link href={{ pathname: '/member', query: { id: author.id } }}>
         <div className="authorBlock">
            <img className="authorImg" src={author.avatar} />
            <a className="authorLink">{author.displayName}</a>
         </div>
      </Link>
   );
};
AuthorLink.propTypes = {
   author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired
   })
};

export default AuthorLink;
