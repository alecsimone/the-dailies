import styled from 'styled-components';
import Head from 'next/head';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import { setAlpha } from '../styles/functions';
import SummarizedText from '../components/SummarizedText';

const StyledCheatSheet = styled.article`
   padding: 3rem;
   margin: 0;
   ${props => props.theme.mobileBreakpoint} {
      margin: 4rem;
   }
   border: 2px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
   background: ${props => props.theme.lightBlack};
   box-shadow: 0 4px 4px ${props => setAlpha(props.theme.deepBlack, 0.2)};
   max-width: 1280px;
   ul {
      background: ${props => props.theme.midBlack};
      padding: 2rem 3rem;
      li {
         list-style-type: none;
         h4 {
            margin: 0;
            font-size: ${props => props.theme.bigText};
         }
         p {
            margin-left: 2rem;
         }
         span.emphasis {
            font-weight: 600;
            color: white;
         }
      }
   }
`;

const Styling = props => (
   <section>
      <Head>
         <title>Style Cheat Sheet - Ouryou</title>
      </Head>
      <StyledCheatSheet>
         If you're writing comments or making your own things, here are some
         things you can do:
         <ul>
            <li>
               <h4>Start / Cancel Editing</h4>
               <p>
                  First off, you can make any text which you have permission to
                  edit editable (or stop editing any text you might already be
                  editing) by{' '}
                  <span className="emphasis">
                     either double right clicking or double middle clicking the
                     text
                  </span>
               </p>
            </li>
            <li>
               <h4>Pounds</h4>
               <p>
                  Enclosing text in pound signs,{' '}
                  <span className="emphasis">##like so##</span> turns it into a
                  big ol' header. You can also add these by pressing ctrl/cmd +
                  # (or just ctrl/cmd + 3), with or without text selected.
               </p>
            </li>
            <li>
               <h4>Stars</h4>
               <p>
                  Enclosing text in asterisks,{' '}
                  <span className="emphasis">**like so**</span> makes it bold
                  and bright. You can also add these by pressing ctrl/cmd + b,
                  with or without text selected.
               </p>
            </li>
            <li>
               <h4>Bars</h4>
               <p>
                  Enclosing text in underscores,{' '}
                  <span className="emphasis">__like so__</span> underlines it.
                  You can also add these by pressing ctrl/cmd + u, with or
                  without text selected.
               </p>
            </li>
            <li>
               <h4>Slashes</h4>
               <p>
                  Enclosing text in forward slashes,{' '}
                  <span className="emphasis">//like so//</span> italicizes it.
                  You can also add these by pressing ctrl/cmd + i, with or
                  without text selected.
               </p>
            </li>
            <li>
               <h4>Style Tag</h4>
               <p>
                  You can also enclose any text in a{' '}
                  <span className="emphasis">{`<style>`}</span> tag to tag to
                  apply any styling you'd like to it.
               </p>
               <p>
                  The full syntax would be{' '}
                  <span className="emphasis">{`<style="YOUR STYLING HERE">Text you want to style</style>`}</span>
                  , and your styling should follow the syntax of using
                  JavaScript to style html elements,{' '}
                  <a
                     href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Properties_Reference"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     See here for more info
                  </a>
                  .
               </p>
               <p>
                  So for example,{' '}
                  <span className="emphasis">{`<style="fontWeight:bold; color:green">Text you want to style</style>`}</span>{' '}
                  would produce bold, green text.
               </p>
            </li>
            <li>
               <h4>Summaries</h4>
               <p>
                  This one's a little tricky, so let's start with an example.
                  Here's a summary:
               </p>
               <SummarizedText
                  summarizedText="This is a long winded point that you wanted to make, but don't necessarily want everyone to have to read every time. Maybe you went really in depth on a topic, or maybe it's a tangential aside, doesn't really matter. The point is just it's a big block of text that can be summarized quickly."
                  summaryText="A quick summary of your point. Click the arrow to expand"
               />
               <p>
                  The syntax for summaries is as follows:{' '}
                  <span className="emphasis">
                     {'>>Text to be summarized<<(Summary text)'}
                  </span>{' '}
                  That is, you take the big complicated aside and wrap it in
                  backwards double angle brackets (The idea is they're arrows
                  pointing inwards, like they're crushing it down), and then you
                  take the text you want to use as the summary and put it inside
                  parentheses immediately after that (as in, no spaces between
                  them).
               </p>
               <p>
                  If you hit ctrl/cmd + >, we'll add the tag for you. (Note: >
                  is the shift version of the . key, and either will work)
               </p>
            </li>
            <li>
               <h4>Blockquotes</h4>
               <p>
                  Enclosing a quote in angle brackets,{' '}
                  <span className="emphasis">
                     {`<"`}like so{`">`}
                  </span>{' '}
                  will put it in blockquote formatting. If you hit ctrl/cmd + "
                  (or just '), we'll add the tag for you.
               </p>
               <p>
                  If you want to apply styling to the whole quote (say, for
                  instance, pounds or stars), do it OUTSIDE the angle brackets.
                  You can also apply styling to any text within the block quote,
                  but to style the whole thing, including the quotation marks,
                  you have to enclose the angle brackets in that other style
                  notation.
               </p>
            </li>
            <li>
               <h4>Code</h4>
               <p>
                  Enclosing a code block in a {'<code>'} tag,{' '}
                  <span className="emphasis">
                     {`<code lang="js">`}like so{`</code>`}
                  </span>{' '}
                  will make a code block with syntax highlighting.
               </p>
               <p>
                  Make sure to include the lang="" parameter (and that you use
                  double quotes) along with the name of the language your code
                  is written in. For a list of available languages, see{' '}
                  <a
                     href="https://prismjs.com/#supported-languages"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     here
                  </a>
                  .
               </p>
            </li>
            <li>
               <h4>Bracket Links</h4>
               <p>
                  You can just paste a link in and it will work properly, but if
                  you'd like to change the display text of the link,{' '}
                  <a
                     href="https://youtu.be/vDUYLDtC5Qw"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     like this
                  </a>
                  , you can use markdown's bracket notation.
               </p>
               <p>
                  To do this, you put the display text inside brackets,
                  immediately followed by the link URL inside parentheses, like
                  this:{' '}
                  <span className="emphasis">[display text](link URL)</span>
               </p>
               <p>
                  So if you put [display text](link URL) into a comment or post
                  on Ouryou, it will show up like this:{' '}
                  <a href="link URL" target="_blank" rel="noopener noreferrer">
                     display text
                  </a>
                  .
               </p>
               <p>
                  <span className="emphasis">
                     For a shortcut, you can use the hotkey ctrl/cmd + k
                  </span>
                  . If you have text selected when you do that, it will
                  automatically make it the display text for your link and put
                  your cursor inside the parentheses to add the URL. If you
                  don't have text selected it will just drop a blank link tag in
                  and put your cursor inside the square brackets to add the
                  display text.
               </p>
               <p>
                  Also, if you don't provide a valid URL for the link URL inside
                  the parentheses, we assume it's the ID of a Thing, and we'll
                  make the link point at a thing with that ID.
               </p>
            </li>
            <li>
               <h4>Thing Search</h4>
               <p>
                  You can search all the things on Ouryou and generate a link to
                  them in many of the inputs on the site. As you're writing, if
                  you type <span className="emphasis">[[SEARCH TEXT</span> a
                  little results box will pop up showing Things matching your
                  search text. If you select one, your search will be completed
                  with a link to that thing.
               </p>
               <p>
                  Just to be extra clear, you can start a search for a thing by
                  doing a double open square bracket ( [[ ) and then we'll
                  search for anything after those brackets (stopping when we get
                  either to closing brackets or a space after or immediately
                  before your cursor), and when you choose the post you want to
                  link to, we'll replace your search text with a link to that
                  post.
               </p>
            </li>
            <li>
               <h4>Exploding Links (Images, videos, links to things)</h4>
               <p>
                  If you paste in a plain link to any image or video (including
                  YouTube videos, TikToks, some Instagram posts, and GFYcats),
                  the media file will be embedded directly into your post.
               </p>
               <p>
                  This also works for links to Things on Ouryou. If you paste in
                  a plain link to one of them, it will be replaced with a little
                  card for the thing you're linking to.
               </p>
            </li>
            <li>
               <h4>Image Transcription</h4>
               <p>
                  If you enclose a link to an image file in {'<text></text>'}{' '}
                  tags,{' '}
                  <span className="emphasis">{'<text>like_so.jpg</text>'}</span>
                  , we'll transcribe the text in the image and replace that tag
                  with the transcribed text as a blockquote.
               </p>
               <p>
                  The supported file types are .png, .jpg, .jpeg, .gif, .tif,
                  .tiff, and .bmp. If you've taken a picture you want
                  transcribed (say, if you're reading a physical book and want
                  to clip a quote from it at length), I'd recommend uploading
                  the image to{' '}
                  <a href="https://imgur.com/upload" target="_blank">
                     imgur
                  </a>{' '}
                  and then using their link to the picture.
               </p>
               <p>
                  One day we'll probably support uploading your own images (for
                  posting directly as well, of course), but for right now
                  hosting images is a little beyond the scope of this project,
                  and we're just going to piggyback off of everyone else who's
                  already doing it so incredibly well.
               </p>
            </li>
            <li>
               <h4>Reddit Links</h4>
               <p>
                  We also support linking to a subreddit by just typing{' '}
                  <span className="emphasis">/r/SubredditName</span>, as you can
                  do on reddit itself.
               </p>
               <p>
                  For instance, if you type /r/funny, that will be replaced by a
                  link to the funny subreddit.
               </p>
            </li>
            <li>
               <h4>Twitter Mentions</h4>
               <p>
                  If you type <span className="emphasis">@SomeText</span>, it
                  will be treated as a link to the user SomeText on twitter.
               </p>
               <p>
                  One exception to this is that we also turn email addresses
                  into mailto: links to that email address, so if you type in an
                  email address, it will be treated like an email address and
                  not like a twitter mention.
               </p>
            </li>
            <li>
               <h4>Enclose selected text</h4>
               As a fun little bonus, if you have text selected and type either
               a <span className="emphasis">{`(, [, \{, \", \', or \``}</span>,
               we'll wrap that text in that kind of character.
            </li>
         </ul>
      </StyledCheatSheet>
   </section>
);

export default Styling;
