FROM petrosagg/resin-wpe:raspberrypi3-30c7465


COPY wait-for-it.sh /wait-for-it.sh
COPY udev-rules/ /etc/udev/rules.d/
COPY wpe-init /wpe-init
RUN chmod +x /wait-for-it.sh
RUN chmod +x /wpe-init

CMD  /wait-for-it.sh -t 60 frontend:3000 -- /wpe-init
