FROM ubuntu:20.04

# not to prompt `Configuring tzdata`
ARG DEBIAN_FRONTEND=noninteractive

RUN mkdir -p /home/leasehold/leasehold-core; \
    useradd -ms /bin/bash leasehold; \
    apt-get update; \
    apt-get install -qqy git curl wget build-essential gzip lsb-release; \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main" > /etc/apt/sources.list.d/PostgreSQL.list'; \
    apt-get update; \
    apt-get install -qqy postgresql-10 nodejs; \
    sed -i 's/max_connections = 100/max_connections = 300/g' /etc/postgresql/10/main/postgresql.conf; \
    sed -i 's/shared_buffers = 128MB/shared_buffers = 256MB/g' /etc/postgresql/10/main/postgresql.conf

# COPY . /home/leasehold/leasehold-core/
WORKDIR /home/leasehold/leasehold-core/

USER postgres

RUN service postgresql start && \
  psql -c "CREATE USER leasehold" && \
  psql -c "ALTER ROLE leasehold WITH SUPERUSER" && \
  psql -c "CREATE DATABASE lisk_main OWNER leasehold" && \
  psql -c "CREATE DATABASE leasehold_main OWNER leasehold" && \
  psql -c "ALTER USER leasehold WITH PASSWORD 'password'"
  # createdb lisk_main --owner leasehold && \
  # createdb leasehold_main --owner leasehold

USER leasehold

# RUN service postgresql start && \
# RUN gzip --decompress --to-stdout ./lisk_main_backup-14576795.gz | psql lisk_main -w && \
#   gzip --decompress --to-stdout ./leasehold_main_backup_27022021.gz | psql leasehold_main -w && \


# # DB Snapshots
# RUN rm -f ./lisk_main_backup-14576795.gz
# RUN rm -f ./leasehold_main_backup_27022021.gz


# # # NPM
# RUN npm install
# RUN npm install pm2 -g
# RUN npm i -g lisk-commander@2.2.3
# RUN lisk config:set api.nodes http://2.56.213.101:8010/

CMD ["pm2", "start", "leasehold-core-mainnet"]
