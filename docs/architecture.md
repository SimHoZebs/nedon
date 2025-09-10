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