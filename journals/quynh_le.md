### <span style="color: green;">Journal 📠

<span style="color: green;">*06/28*

- Today was our first day working on the project. We kicked off by setting up Docker and a table database with pgAdmin, creating the necessary credentials for it.

<span style="color: green;">*06/30*

- We encountered some difficulties while setting up the tables, facing migration history errors. As a result, we had to delete all volumes and containers to resolve the issue.

<span style="color: green;">*07/06*

- I focused on implementing back-end authentication using Paul's example, and I'm happy to report that everything is now working smoothly. This will help us protect our endpoints effectively.

<span style="color: green;">*07/11*

- Each team member worked on their respective endpoints. Adapting to FastAPI was a bit challenging for all of us, but we're gradually making progress. Additionally, we had to figure out how to store music files in the system.

<span style="color: green;"><span style="color: green;">*07/13*

- To make file storage more accessible, I decided to set up an S3 bucket where we can store all the uploaded files. I also configured the necessary AWSCLI credentials in our Dockerfile, ensuring everyone has access to it. On top of that, I completed the CRUD API endpoints for songs and shared the functions for uploading and deleting files from S3, so that others could integrate them into their endpoints.

<span style="color: green;">*07/19*

- Today, we collaborated on styling the main landing page using online materials. This page will be the default destination for non-logged-in users.

<span style="color: green;">*07/24*

- I started working on the deployment process today, but encountered numerous errors along the way. After testing different commands, I eventually succeeded in deploying the project. However, we ran into an issue where we can no longer upload songs due to limitations imposed by the Galvanize cloud service. We're currently exploring alternative solutions.

<span style="color: green;">*07/26*

- Today, we completed the deployment process and ran all unit tests. We also held a group session to review how to check and approve merge requests, as well as how to address any pipeline issues that arise.

<span style="color: green;">*07/28*

- I collected all the components from each team member and refactored them into our profile page, aiming for a more minimalistic design. While we couldn't complete everything we initially planned, the end result looks fantastic!