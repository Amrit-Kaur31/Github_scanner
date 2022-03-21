const express = require('express');
const app = express()
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const fetch = require('node-fetch');

// Please fill github details
const gitDetails = {
  githubConvertedToken: "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",
  githubUserName: "Amrit-Kaur31",
};

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
  client
    .query({
      query: gql`query {
        user(login: "${gitDetails.githubUserName}") {
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
        const data = JSON.stringify(result);
        console.log(data);
        res.send({success:true, data:data})
    })
    .catch(error => console.error(error));
});

// Details of repository
app.get('/repoDetail', function(req, res) {
  client
    .query({
      query: gql`query {
        repository(owner: "${gitDetails.githubUserName}", name: "repoA"){
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
  const data = JSON.stringify(result);
  console.log(data);
  res.send({success:true, data:data})
})
.catch(error => console.error(error))
});

app.listen(8000, () => console.log(`The server is running on port 8000`))