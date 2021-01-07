import LoadingRing from './LoadingRing';

const LoadMoreButton = ({ loading, noMore, fetchMore }) => {
   if (loading && !noMore) {
      return <LoadingRing />;
   }
   if (!noMore) {
      return (
         <button
            className="loadMore"
            onClick={() => {
               if (loading || noMore) return;
               fetchMore();
            }}
         >
            Load More
         </button>
      );
   }
   return <div className="loadMore">That's all, folks!</div>;
};

export default LoadMoreButton;
