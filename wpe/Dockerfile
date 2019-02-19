FROM petrosagg/resin-wpe:raspberrypi3-30c7465

COPY wait /wait
COPY udev-rules/ /etc/udev/rules.d/
COPY wpe-init /wpe-init
RUN chmod +x /wait
RUN chmod +x /wpe-init

CMD  /wait && /wpe-init
