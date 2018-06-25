# Chachara API

### Development

Ensure your local MySQL server is running.

Create the database if you haven't already done so
  
    mysql> CREATE DATABASE chachara;

Ensure environment variables are set. Use `.env.sample` as a guide and copy the variables into a `.env` file.

Seed your development database:

    $ npm run seed

This command assumes you have a username 'root' with no password set.

### Deployment

    $ npm run deploy

### Testing

Ensure your local MySQL server is running and run the tests:

    $ npm test