```mermaid
sequenceDiagram
    participant User
    participant App as "Application"
    participant PlaidLink as "Plaid Link"
    participant tRPC as "tRPC API"
    participant Plaid as "Plaid API"
    participant DB as "Database"

    User->>App: Opens application
    App->>tRPC: Calls `user.get` query
    tRPC->>DB: Fetches user data
    DB-->>tRPC: Returns user data
    tRPC-->>App: Returns user data
    alt User has no access token
        App->>tRPC: Calls `createLinkToken` query
        tRPC->>Plaid: Calls `linkTokenCreate`
        Plaid-->>tRPC: Returns link token
        tRPC-->>App: Returns link token
        App->>PlaidLink: Initializes with link token
        PlaidLink->>User: Prompts user to link account
        User->>PlaidLink: Links account
        PlaidLink->>App: Returns public token
        App->>tRPC: Calls `setAccessToken` mutation
        tRPC->>Plaid: Calls `itemPublicTokenExchange`
        Plaid-->>tRPC: Returns access token
        tRPC->>DB: Saves access token to user
        DB-->>tRPC: Returns success
        tRPC-->>App: Returns success
    end
    App->>tRPC: Calls `auth` query
    tRPC->>Plaid: Calls `authGet`
    Plaid-->>tRPC: Returns account data
    tRPC-->>App: Returns account data
    App->>User: Displays account data
```

### Plaid Authentication Sequence Diagram Documentation

This diagram illustrates the sequence of events that occur when a user authenticates with the application using Plaid.

1.  **User opens application:** The user opens the application.
2.  **`user.get` query:** The application calls the `user.get` tRPC query to fetch the user's data from the database.
3.  **No access token:** If the user does not have a Plaid access token, the application initiates the Plaid Link flow.
4.  **`createLinkToken` query:** The application calls the `createLinkToken` tRPC query to get a link token from Plaid.
5.  **Plaid Link initialization:** The application uses the link token to initialize the Plaid Link component.
6.  **User links account:** The Plaid Link component prompts the user to link their bank account.
7.  **Public token:** Once the user has linked their account, Plaid Link returns a public token to the application.
8.  **`setAccessToken` mutation:** The application calls the `setAccessToken` tRPC mutation, passing the public token.
9.  **Access token exchange:** The tRPC API exchanges the public token for an access token with the Plaid API.
10. **Database update:** The tRPC API saves the access token to the user's record in the database.
11. **`auth` query:** The application calls the `auth` tRPC query to fetch the user's account data from Plaid.
12. **Display account data:** The application displays the user's account data.
