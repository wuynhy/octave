# Octave
- Quynh Le
- Alex Mao
- Alondra Solix
- Tom Yamaguchi
- Anthony He
## Design
- [API Design](./docs/apis.md)
- [Data-Model](./docs/data-models.md)
- [GHI](./docs/ghi.md)
- [Integrations](./docs/integrations.md)
## Intended market
Target audience are people who love to listen music and want to connect with others with the same taste.
## Functionality
- Visitors to the site can create an account to listen to music, create stages, and connect with others.
- Users can search for stages and songs based on the genres they like.
- Users can also add and follow each other on the platform.
- Users can also create their own playlists to share in the stages and with friends.
- Main Page features popular stages and music.
- Everything can be accessed through the profile page.
## Project Initialization
1. Clone the repository down to your local machine
2. CD into the new project directory
3. Run `docker volume create postgres-data`
4. Run `docker volume create pg-admin`
5. Run `docker compose build` (`DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build` if on macOS with M1 chip & up)
6. Run `docker compose up`
7. deployed website go here https://cali-pals.gitlab.io/module3-project-gamma/
