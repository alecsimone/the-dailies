import Link from 'next/link';
import PropTypes from 'prop-types';

const AuthorLink = props => {
   const { author } = props;
   return (
      <Link href={{ pathname: '/member', query: { id: author.id } }}>
         <a className="authorLink">{author.displayName}</a>
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
