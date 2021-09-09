The Collections App is something of an app within an app which allows you to organize the notes you've taken and the things you've made into a collection.

These collections are represented by their own type in the database. When the collections page is loaded, it pulls in the last active collection (which is itself represented by a value on the member model), as well as a list of all the member's collections. The last active collection is then rendered, along with a dropdown allowing users to navigate between collections.

There are two main views for the app. The first allows members to create their own custom groups which they can manually populate with things, the second groups all currently loaded things by their tags.

The collections app allows for several different categories of user interaction:

Primarily, users can interact with the app by dragging and dropping its various components around. Things can be moved from group to group this way, and they can be rearranged within each group via drag and drop as well. Beyond that, the groups themselves may also be dragged and dropped around within a dynamic number of columns. When grouping by tags, dragging things into or out of a group will add or remove the relevant tag to that thing.

Users may also filter and hide the various things and groups within the app. They can filter through a text input at the top of the app, which will effectively do a search through all the things and show only the relevant ones, and they can hide any thing or group within the app. This is a separate action from removing any of the groups (which can only be done when grouping manually), and it can be undone by unhiding the hidden things or groups.

That leads us to the final category of interactivity, a set of buttons at the top of the page, which allow users to execute various high level commands. This includes resetting the collection to its initial state, adding manual groups, showing hidden groups or things, and toggling between tag and manual groupings. There is also a load more button at the bottom of the page that allows the user to load in more things.

This leads us with a variety of data we need to keep track of for each collection.

-**groupByTag**: whether the app is displaying the tag view or the manual group view

-**filterString**: any text entered into the filter input which will filter which things are visible

-**hiddenThings**: what it sounds like. Any things that have been hidden. hiddenTags and hiddenGroups are similarly self-explanatory.
-**hiddenTags**
-**hiddenGroups**

-**userGroups**: any manually created groups and their properties, including which things are in them

-**groupOrders**: the order of things within any groups, manually created or tag-based

-**columnOrders**: the order of groups within the dynamic columns. This is only for the manual group view, as the tag view has its own columnOrders property, allowing them both to be stored at the same time and toggled between

-**tagColumnOrders**: the order of groups for the tag view

-**expandedCards**: A list of any cards which have been expanded to show the full data for the thing. This allows that state to persist after dragging and dropping a card, and also to persist through reloads of a page or different sessions.