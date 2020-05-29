# Seats Frontend

Seats frontend contains the user interface for booking workstations at Leipzig University Library to realize hygiene regulations of state of Saxony.

## Requirements

There hasn't yet any special requirements running this project. All pages can be loaded at browser as standard html pages.

For simulating a handy web environment and developing purposes it will be delivered a dockerimage at a void nodejs container. Therefor you have to run a docker environment and on occasion npm to reload packages during developing on your desktop.

## Install

Download the repository via git:

```
$# git clone git@git.sc.uni-leipzig.de:ubl/bdd_dev/arbeitsplatzbuchungssystem-frontend.git
```

If you like to use _docker-compose_ put in:

```
$# docker-compose up --build
```

... to build and run the docker image.

If your like to build and run the image separately from the docker command line use for example:

```
$# docker build --tag seats:latest .
$# docker run --rm -p 3000:3000 --name seats seats:latest
```

The image should report successfully _'Listening on port 3000'_. Go to your browser and type in: _localhost:3000_ to get output of the app.

## Configuration

Adjust the api uri to connecting the backend of the booking workstation software at file _js/app.js_  giving required parameter at 

'''
let api = new Api ("localhost:12105/booking");
'''

## Production

For production use it is necessary to include the **/public** folder only.

## License

Copyright (C) 2020 Leipzig University Library <info@ub.uni-leipzig.de>

Histvv is free software: you can redistribute it and/or modify it under the
terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

Histvv is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program.  If not, see <http://www.gnu.org/licenses/>.
