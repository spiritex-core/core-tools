FROM		node:20
LABEL		name="spiritex-core"
LABEL		description="SpiritEx Core Server"
LABEL		version=0.5.0

COPY ./docker/server            /server
WORKDIR /server
RUN npm install --save @spiritex/spiritex-core
# RUN npm install --save @spiritex/core-tools

# VOLUME /server/host
EXPOSE 4200

# ENTRYPOINT [ "npx", "mocha", "-u", "bdd",  "tests/*.js", "--timeout", "0", "--slow", "20", "--colors" ]
# ENTRYPOINT [ "npx", "mocha", "-u", "bdd",  "tests/000*.js", "--timeout", "0", "--slow", "20", "--colors" ]

# ENTRYPOINT [ "npm", "SpiritEx-RunServer", "--folder", "/server/host" ]
ENTRYPOINT [ "bash" ]

