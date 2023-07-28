## July 26

Today, I worked on:

* Merge Requests

Went to pull from main so I could have up to date code, but kept getting an error saying that I had a divergent branch. Alex and Tom tried to help me solve it, but eventually we just agreed that I should just clone the updated version of the project. Tom had previously had the same issue and he found that just cloning the newer version of the project worked best.

## July 25

Today, I worked on:

* FrontEnd

Went back to work on my search bar so we could search for stages by name and genre. Also so we could search for playlists by name. 

## July 24

Today, I worked on:

* Deployment

I began working on deployment, but as soon as I began it was giving me a hard time. When I downloaded cirrus it was downloading as readable only, so I wasn't able to make any changes. When ever I would run the command sudo ./install.sh I would get a error that said unable to load certificate. I posted it on help me understand and Rosheen came in to try and help me. We eventually got to the place where another team member had to do it. Quynh attempted the deployment, but got the same errors that I was getting. She switched to another laptop and it was able to work on there. We aren't completely sure why it worked on the other computer. Quynh mentioned that it was the exact account as the other computer. 

## July 20

Today, I worked on:

* FrontEnd and Deployment

I finally got a list of songs to display, but the search bar was only filtering out by song title and song artist. I couldn't get it to work fr genres. It took most of the day, but I was finally abl to figure out how to do it. I needed to filter out for genres differently because when I created a song I used a genre index number not the genre name. Began to start looking into deployment.

## July 19

Today, I worked on:

* FrontEnd

Continued working on the search bar, bu was still having a hard time getting my FrontEnd to display anything. Anthony showed me how he was able to get stages to display. I was able to get an idea of how to get it working for songs.

## July 18

Today, I worked on:

* Unit Tests, FrontEnd

Worked on unit tests a little. Began working on my portion of the FrontEnd. I am assigned with creating a search bar that allows users to search for songs by artist, title, and genre. I am having a difficult time getting the songs I created to display.

## July 17

Today, I worked on:

* Unit Tests, Endpoints

Went back and reviewed my endpoints and began working on unit tests.

## July 12

Today, I worked on:

* Debugging of Login Form

We continued to try and debug the previous day Login Form  SyntaxError and eventually decided to ask for help in Help Me Understand. We received so helpful pointers from Tracey and Quynh was able to fix the error.

## July 11

Today, I worked on:

* Finishing endpoints, Frontend Auth, and  Debugging

I finished my Genre endpoints. As a group we were having trouble creating migrations. So we figured out that we had to DROP the table migrations in PG_Admin and then run python -m migrations down and python -m migrations up in the docker terminal. We were also getting a SyntaxError with the Login Form that we weren't able to solve.

## July 10

Today, I worked on:

* Creating endpoints

Started creating the endpoints for Genres. I started on a endpoint for get all Genres and a endpoint for get one Genre.
