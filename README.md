# Ouryou
> A social note-taking app to help you organize and share your thoughts and to keep up with what your friends are learning

Welcome to the Ouryou github repo, thanks for checking it out! The documentation is still extremely sparse because I've been putting it off till the end, but I hope you'll find what little there is helpful.

This repo is divided into two main parts, which in practice correspond to the two different apps that make it up, one each for the backend and frontend.

The frontend is a [Next.js](https://nextjs.org/) React app, using [Apollo Client](https://www.apollographql.com/) to handle querying and caching data from the backend.

The backend is an express server running [Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started/) and using [Prisma](https://www.prisma.io/) (still on Prisma 1) to interface with a postgres database.

For more details on either app, please check their respective directories, but here's a quick high level overview of what we're doing here.

# Frontend

Members can create notes, which we call "Things." Things have comments and various meta data (privacy, tags, updated/created times, etc), but primarily they're made up of Content Pieces, which themselves can have comments as well.

Content Pieces are displayed using a component called RichText, which allows the author to do all kinds of cool things with their text, which are detailed [here](https://ourdailies.org/styling).

One of the main features Things provide to authors is what I call 3D text, which is explained in more detail in [this thing](https://ourdailies.org/thing?id=ckhsfr26e02de0765hyna3sv5). The basic idea is that all text everywhere exists in one dimension, top to bottom. But we add two new directions: side to side, by allowing you to comment on individual content pieces, and depth, by allowing you to embed things and content pieces or to provide collapsable summaries within content pieces.

Also tucked inside the frontend app is a neat little Twitter reader I made for myself that doesn't really have much relation to the rest of the site, although it does include a "save tweet" feature that makes it really easy to turn a tweet into a Thing.

On a technical level, the frontend app uses Apollo Client to query for all the data it needs. First it gets data for the logged in user, which it puts in React Context at just about the highest level of the app, and then it queries for whatever data the current page needs, which will probably be put into context at the page level. It also uses Apollo to subscribe to updates to any of that data.

# Backend

The backend is fairly straightforward. It provides a graphql endpoint, and most of the resolvers only do basic authentication / filtering logic before passing the request off to Prisma to retrieve the data from the database.

One important thing to know is that there is a dedicated function, properUpdateStuff, which is used for most updates to any kind of data (Stuff is my generic name for things, content pieces, comments, tags, and formally exists as a union of those data types). This function checks for permission to update the stuff, updates it, and then notifies any subscribers who may be listening for updates to it.

# Conclusion

That's all I've got for now. Later on, once we're better set up to accept community contributions, hopefully this readme will include instructions on how to contribute and any principles we'd like contributors to keep in mind, but for now that's not really a thing.

Feel free to look around, or to reach out with any questiosn or suggestions.

Thanks for your  time,
Alec