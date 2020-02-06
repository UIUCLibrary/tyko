FROM node:lts-alpine3.9

ADD package.json package.json
ENV NODE_PATH=/node_modules
RUN npm install  --global
#RUN addgroup -S dummy && adduser -S dummy -G dummy
#COPY . /testing/
#USER dummy
#RUN whoami
##RUN which bash
#CMD /bin/sh