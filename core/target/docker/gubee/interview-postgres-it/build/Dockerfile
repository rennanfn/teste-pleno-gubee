FROM postgres

COPY init_schema.sql /docker-entrypoint-initdb.d/
EXPOSE 5432

ENV POSTGRES_PASSWORD=gubee

CMD ["postgres"]

