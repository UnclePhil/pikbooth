FROM node:10-alpine

##install git  for gphoto2 install
RUN  apk add --no-cache  git python build-base

# Defines our working directory in container
WORKDIR /usr/src/app

# Copies the package.json first for better cache on later pushes
COPY package.json package.json

# This install npm dependencies on the resin.io build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.
RUN npm config set depth 0 
RUN  JOBS=MAX npm install --production

RUN  git clone https://github.com/soixantecircuits/node-gphoto-fii.git
RUN  mv node-gphoto-fii ./node_modules

# This will copy all files in our root to the working  directory in the container
COPY . ./

# server.js will run when container starts up on the device
CMD ["node", "app.js"]