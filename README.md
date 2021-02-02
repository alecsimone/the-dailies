<img src="https://ourdailies.org/logo.png" align="left">

#  Ouryou 
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

# History

This app has gone through several major evolutions, so I wanted to give a little context in case it helps anything make sense.

The precursor to all this was a project called [Rocket Dailies](https://github.com/alecsimone/TheDailies), which was a small community of fans dedicated to finding the best Rocket League play of the day. It primarily existed as a twitter account and a twitch stream, but it also had a website set up to keep track of everything.

I had always intended to expand out from Rocket League into as many other areas as I could, but for a long, long list of reasons, that just didn't turn out to be practical. So instead, I decided to do a major 180 and switch from finding the best Rocket League play of the day to finding the most important news story of the day, using roughly the same system, which would be called Our Dailies.

However, after trying that for a couple months, I realized two things:

1. That's not really a meaningful thing to do. I'd always known it would be impossible and silly to try to ACTUALLY declare a "most important story of the day," but I at least thought trying would lead to some interesting conversations. It kind of didn't, though. Most days either one thing was obviously the most important, so there wasn't much room for debate, or nothing really happened, so there wasn't much to talk about.

2. Caring about the news is kind of dumb. My current thinking on this is heavily influenced by [Matt Christman](https://twitter.com/cushbomb), but I'm pretty sure I technically got there a little before him, although he has articulated it much better than I ever did. Basically, the best way to view The News these days is as some weird fandom, just like sports or music or a TV show. We like to believe it's our duty to be informed citizens, but democracy is in such shambles these days that it really doesn't matter if you keep up with politics and world events. You don't have any way of influencing them, and following them is really just this weird habit some people have that they probably don't even enjoy. Sure maybe being informed will help you manage your personal life in some way, but in that sense you're really much better off following some hyper-localized news source than arguing with people on the internet about what the most important story in the world is.

In short, I decided focusing on the most important news of the day was a waste of time, and that we should do something else instead.

In the process of transitioning to cover the news though, I started making a series of YouTube videos discussing some of my favorite articles I'd ever read. While I was making those, I realized how much I wanted an app that would both help me take notes on what I was reading and then also turn them into a nice visual aid I could use when presenting the video, while providing a nice convenient, well-organized info dump for viewers who wanted to read more about the topic.

So I started working on a note-taking app like that, and as I did I realized how great it would be to add a social component to it, both so the notes were really easy to share and so I could keep up with what my friends were learning about without them even having to personally share their notes with me.

And thus Ouryou was born, although that name is fairly new and I haven't grown to love it yet, and I'm still not sure exactly what the driving ["Why"](https://www.youtube.com/watch?v=qp0HIF3SfI4) of this project is going to be. But this is a github repo, not a marketing meeting, so I think that's good enough for our purposes.


# Conclusion

That's all I've got for now. Later on, once we're better set up to accept community contributions, hopefully this readme will include instructions on how to contribute and any principles we'd like contributors to keep in mind, but for now that's not really a thing.

Feel free to look around, or to reach out with any questiosn or suggestions.

Thanks for your  time,
Alec
