import styled from 'styled-components';

const StyledTweets = styled.section`
   position: absolute;
   top: 0;
   left: 2%;
   width: 96%;
   padding: 0;
`;

const Tweets = props => {
   const { list } = props;
   const tweets = JSON.parse(list.tweets);

   console.log(tweets);

   const tweetElements = tweets.map(tweet => (
      <div>
         <h6>{tweet.user.name}</h6>
         {tweet.full_text}
      </div>
   ));

   return (
      <StyledTweets>
         <h5>{list.name}</h5>
         <div className="tweets">{tweetElements}</div>
      </StyledTweets>
   );
};

export default Tweets;
