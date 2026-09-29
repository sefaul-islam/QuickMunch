-- Create databases for each microservice
-- The default 'postgres' database is used by the postgres container itself.
-- Each service gets its own isolated database.

CREATE DATABASE quickmunchdb;
CREATE DATABASE quickmunch_restaurants;
CREATE DATABASE quickmunch_orders;
