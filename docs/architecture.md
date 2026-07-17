# Architecture FAQs

## File Uploads

**Q: Why direct-to-storage uploads instead of proxying through our server?**

**A:** For performance and scalability. Direct uploads are faster and reduce our server load.

**Q: How is this secure?**

**A:** The server generates a **temporary, single-use presigned URL**. We control:
- **Path:** The exact upload destination.
- **Action:** The URL only allows an `upload` (`PUT`) operation.
- **Expiration:** The URL is short-lived (60s).
- **Auth:** Only authenticated users can request an upload URL.

**Q: What is the upload flow?**

1.  **Client -> Server:** Get a presigned upload URL.
2.  **Client -> Storage:** `PUT` the file directly to the URL.
3.  **Client -> Server:** Notify the server with the file's path to trigger processing.

## Client Data Contracts

**Q: Why must frontend types not be derived from Prisma models?**

**A:** Prisma models describe database storage, not the public API. Deriving client types from them couples UI code to database migrations and can accidentally expose private columns. Shared client contracts are explicit Zod schemas, while Prisma query configuration and model types stay under `server/`.

**Q: How should server data cross the tRPC boundary?**

**A:** Procedures return purpose-specific DTOs and declare output schemas. Server mappers convert database records to those DTOs before returning them. Sensitive fields such as bank access and sync tokens are represented only by boolean capability flags when the client needs that information.

**Q: How are monetary values represented outside the database?**

**A:** Money crosses the API as decimal strings so the transport and frontend do not depend on Prisma or lose precision through JavaScript numbers. Prisma Decimal conversion stays on the server, while frontend calculations use `decimal.js` and convert back to normalized strings for API inputs.

## Financial Data Providers

**Q: Why are provider adapters separate from financial synchronization?**

**A:** Provider adapters translate external connection and data protocols into normalized accounts and transactions. They never write Prisma records. Nedon's financial sync service owns reconciliation, imported originals, editable copies, and checkpoint persistence so every provider follows the same domain rules.

**Q: How are external records identified?**

**A:** Provider identifiers are never assumed to be globally unique. Connections scope accounts, and accounts scope transactions. Internal IDs cross the client boundary; provider credentials and external identifiers remain on the server.

**Q: How can both cursor and snapshot providers use the same boundary?**

**A:** A provider returns either an explicit delta with removals and a checkpoint, or a bounded snapshot with completeness metadata. Snapshot absence is not treated as deletion unless the provider confirms that the observed window is complete.

**Q: How are provider credentials protected?**

**A:** Credentials are encrypted with AES-256-GCM before persistence using `FINANCIAL_DATA_ENCRYPTION_KEY`, which must contain a base64-encoded 32-byte key. Legacy Plaid tokens are accepted only for migration and are encrypted on their first use. Credentials, including SimpleFIN Access URLs, never cross the API boundary or enter provider error messages.

**Q: What amount convention does Nedon use?**

**A:** Imported amounts use the existing Nedon convention: positive values represent spending and negative values represent incoming money. Provider adapters normalize their source convention before returning transactions.
