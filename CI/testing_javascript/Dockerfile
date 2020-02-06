FROM node:lts-alpine3.9

ADD package.json package.json
RUN npm install jest jest-junit --global
#RUN addgroup -S dummy && adduser -S dummy -G dummy
#COPY . /testing/
#USER dummy
#RUN whoami
#WORKDIR /testing
#RUN npm test
##RUN which bash
#CMD /bin/sh