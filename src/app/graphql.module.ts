import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS, APOLLO_NAMED_OPTIONS } from 'apollo-angular';
import {
  ApolloClientOptions,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

const uri1 = `http://localhost:3000/graphql`;
const uri2 = 'http://localhost:3003/graphql';
// <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    link: httpLink.create({ uri: uri1 }),
    cache: new InMemoryCache(),
  };
}

export function createProjectspecApollo(
  httpLink: HttpLink
): ApolloClientOptions<any> {
  return {
    name: 'projectspec',
    link: httpLink.create({ uri: uri2 }),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
    // {
    //   provide: APOLLO_NAMED_OPTIONS,
    //   useFactory: createProjectspecApollo,
    //   deps: [HttpLink],
    // },
  ],
})
export class GraphQLModule {}
