import PropTypes from 'prop-types';
import psl from 'psl';
import { extractHostname } from '../../lib/UrlHandling';
import { homeNoHTTP } from '../../config';

const ShortLink = ({ link, limit }) => {
   if (link == null) {
      return null;
   }

   const hostName = extractHostname(link.toLowerCase());
   const { domain } = psl.parse(hostName);

   let shortlink;
   if (!domain) {
      const start = link.indexOf(hostName);
      shortlink = link.substring(start);
   } else if (limit === 0) {
      shortlink = domain;
   } else {
      let startOfDomain;
      const subdomain = hostName.substring(0, hostName.indexOf(domain));
      if (subdomain === 'www.') {
         startOfDomain = link.toLowerCase().indexOf(domain);
      } else {
         startOfDomain = link.toLowerCase().indexOf(hostName);
      }
      shortlink = link.substring(startOfDomain);
   }

   if (limit && limit < shortlink.length) {
      shortlink = `${shortlink.substring(0, limit).trim()}...`;
   }

   if (shortlink.startsWith('reddit.com/r/')) {
      shortlink = shortlink.replace(
         /reddit\.com(\/r\/[-a-z0-9_]+(?:\/top)*)$/gim,
         (wholeMatch, relevantPart, matchIndex, wholeText) => relevantPart
      );
   }

   let target = '_blank';
   if (shortlink.includes(homeNoHTTP)) {
      target = '_self';
   }

   return (
      <a
         className="shortlink"
         href={link}
         target={target}
         key={link}
         rel="noopener noreferrer"
      >
         {shortlink}
      </a>
   );
};
ShortLink.propTypes = {
   link: PropTypes.string.isRequired,
   limit: PropTypes.number.isRequired
};

export default ShortLink;
// export default React.memo(ShortLink);
