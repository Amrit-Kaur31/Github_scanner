const express = require('express');
const app = express()
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const fetch = require('node-fetch');
app.set('json spaces', 40);

const gitDetails = {
  githubConvertedToken: "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",
}

const cache = new InMemoryCache();
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.github.com/graphql', fetch, headers: {
      'Authorization': "bearer " + gitDetails.githubConvertedToken,
    },
  }),
  cache
});

// List of respositories
app.get('/', async (req, res) => {
  const username = req.query.username;
  client
    .query({
      query: gql`query {
        user(login: "${username}") {
          repositories(last: 50) {
            repos: nodes {
              name
              diskUsage
              owner {
                id
              }
            }
          }
        }
    }
`})
    .then(result => {
        res.send({success:true, result})
    })
    .catch(error => console.error(error));
});

// Details of repository
app.get('/repoDetail', function(req, res) {
  const username = req.query.username;
  const reponame = req.query.reponame;
  client
    .query({
      query: gql`query {
        repository(owner: "${username}", name: "${reponame}"){
          name
          diskUsage
          owner {
            id
          }
          isPrivate
          object(expression: "HEAD:") {
            ... on Tree {
              entries {
                name
                type
                mode
              }
            }
          }
        defaultBranchRef {
          target {
            ... on Commit {
              file(path: "/.github/workflows") {
                type
                object {
                  ... on Tree {
                    entries {
                      name
                      object {
                        ... on Blob {
                          text
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
}
`}).then(result => {
  res.send({success:true, result})
})
.catch(error => console.error(error))
});

app.listen(8000, () => console.log(`The server is running on port 8000`))
