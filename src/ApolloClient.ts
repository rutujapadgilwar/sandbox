import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({ uri: "https://yrpv7w-8000.csb.app/" }),
  cache: new InMemoryCache(),
});

export default client;
