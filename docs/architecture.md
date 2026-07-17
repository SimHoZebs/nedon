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
