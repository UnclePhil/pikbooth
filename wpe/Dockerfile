FROM petrosagg/balena-wpe:raspberrypi3-968d2af


COPY wait-for-it.sh /wait-for-it.sh
COPY udev-rules/ /etc/udev/rules.d/
COPY wpe-init /wpe-init
RUN chmod +x /wait-for-it.sh
RUN chmod +x /wpe-init

# -- Start of resin-wifi-connect section -- #

# Set the device type environment variable using Dockerfile templates
ENV DEVICE_TYPE=%%RESIN_MACHINE_NAME%%

# Use apt-get to install dependencies
RUN apt-get update && apt-get install -yq --no-install-recommends \
    dnsmasq && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install resin-wifi-connect
RUN curl https://api.github.com/repos/resin-io/resin-wifi-connect/releases/latest -s \
    | grep -hoP 'browser_download_url": "\K.*%%RESIN_ARCH%%\.tar\.gz' \
    | xargs -n1 curl -Ls \
    | tar -xvz -C /usr/src/app/

# -- End of resin-wifi-connect section -- #



CMD  /wait-for-it.sh -t 60 frontend:3000 -- /wpe-init
