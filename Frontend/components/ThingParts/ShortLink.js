import PropTypes from 'prop-types';
import psl from 'psl';
import { extractHostname } from '../../lib/UrlHandling';

const ShortLink = ({ link, limit }) => {
   if (link == null) {
      return null;
   }

   const hostName = extractHostname(link);
   const { domain } = psl.parse(hostName);
   const startOfDomain = link.indexOf(domain);
   const headlessLink = link.substring(startOfDomain);

   let shortlink;
   if (!domain) {
      shortlink = hostName;
   } else if (limit === 0) {
      shortlink = domain;
   } else {
      shortlink =
         headlessLink.length <= limit
            ? headlessLink
            : `${headlessLink.substring(0, limit).trim()}...`;
   }

   // let shortlink = extractHostname(link);
   // console.log(shortlink);
   // if (limit === 0) {
   //    shortlink = psl.parse(shortlink).domain;
   // } else {
   //    const startOfName = link
   //    shortlink =
   //       link.length <= limit ? link : `${link.substring(0, limit).trim()}...`;
   // }

   return (
      <a className="shortlink" href={link} target="_blank" key={link}>
         {shortlink}
      </a>
   );
};
ShortLink.propTypes = {
   link: PropTypes.string.isRequired,
   limit: PropTypes.number.isRequired
};

export default ShortLink;
