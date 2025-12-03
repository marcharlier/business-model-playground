# String Format Schemas

Specialized string validators for common formats: emails, URLs, UUIDs, IP addresses, and ID formats.

## Email & URL

```typescript { .api }
/**
 * Create an email validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodEmail schema instance
 */
function email(params?: { description?: string; errorMap?: ZodErrorMap }): ZodEmail;

/**
 * Create a URL validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodURL schema instance
 */
function url(params?: { description?: string; errorMap?: ZodErrorMap }): ZodURL;

/**
 * Create an HTTP/HTTPS URL validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodURL schema instance restricted to HTTP(S)
 */
function httpUrl(params?: { description?: string; errorMap?: ZodErrorMap }): ZodURL;

interface ZodEmail extends ZodType<string, string> {
  // Inherits all ZodString methods
  min(length: number, params?: string | { message?: string }): this;
  max(length: number, params?: string | { message?: string }): this;
}

interface ZodURL extends ZodType<string, string> {}
```

**Examples:**
```typescript
const EmailSchema = z.email();
const result = EmailSchema.safeParse("user@example.com"); // success: true

// With additional constraints
const LimitedEmailSchema = z.email().max(255);

const URLSchema = z.url();
URLSchema.parse("https://example.com"); // Valid

const HTTPOnlySchema = z.httpUrl();
HTTPOnlySchema.parse("https://example.com"); // Valid
HTTPOnlySchema.parse("ftp://example.com"); // Invalid
```

## UUID & GUID

```typescript { .api }
/**
 * Create a UUID validation schema (any version)
 * @param params - Optional configuration with description and error map
 * @returns ZodUUID schema instance
 */
function uuid(params?: { description?: string; errorMap?: ZodErrorMap }): ZodUUID;

/**
 * Create a UUID v4 validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodUUID schema instance
 */
function uuidv4(params?: { description?: string; errorMap?: ZodErrorMap }): ZodUUID;

/**
 * Create a UUID v6 validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodUUID schema instance
 */
function uuidv6(params?: { description?: string; errorMap?: ZodErrorMap }): ZodUUID;

/**
 * Create a UUID v7 validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodUUID schema instance
 */
function uuidv7(params?: { description?: string; errorMap?: ZodErrorMap }): ZodUUID;

/**
 * Create a GUID validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodGUID schema instance
 */
function guid(params?: { description?: string; errorMap?: ZodErrorMap }): ZodGUID;

interface ZodUUID extends ZodType<string, string> {}
interface ZodGUID extends ZodType<string, string> {}
```

**Examples:**
```typescript
const UUIDSchema = z.uuid();
UUIDSchema.parse("550e8400-e29b-41d4-a716-446655440000"); // Valid

const UUIDv4Schema = z.uuidv4();
const UUIDv7Schema = z.uuidv7();
```

## IP Addresses

```typescript { .api }
/**
 * Create an IPv4 address validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodIPv4 schema instance
 */
function ipv4(params?: { description?: string; errorMap?: ZodErrorMap }): ZodIPv4;

/**
 * Create an IPv6 address validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodIPv6 schema instance
 */
function ipv6(params?: { description?: string; errorMap?: ZodErrorMap }): ZodIPv6;

/**
 * Create a CIDR v4 notation validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodCIDRv4 schema instance
 */
function cidrv4(params?: { description?: string; errorMap?: ZodErrorMap }): ZodCIDRv4;

/**
 * Create a CIDR v6 notation validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodCIDRv6 schema instance
 */
function cidrv6(params?: { description?: string; errorMap?: ZodErrorMap }): ZodCIDRv6;

interface ZodIPv4 extends ZodType<string, string> {}
interface ZodIPv6 extends ZodType<string, string> {}
interface ZodCIDRv4 extends ZodType<string, string> {}
interface ZodCIDRv6 extends ZodType<string, string> {}
```

**Examples:**
```typescript
const IPv4Schema = z.ipv4();
IPv4Schema.parse("192.168.1.1"); // Valid

const IPv6Schema = z.ipv6();
IPv6Schema.parse("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); // Valid

const CIDRSchema = z.cidrv4();
CIDRSchema.parse("192.168.1.0/24"); // Valid
```

## Base64 & JWT

```typescript { .api }
/**
 * Create a base64 validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodBase64 schema instance
 */
function base64(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBase64;

/**
 * Create a base64url validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodBase64URL schema instance
 */
function base64url(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBase64URL;

/**
 * Create a JWT validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodJWT schema instance
 */
function jwt(params?: { description?: string; errorMap?: ZodErrorMap }): ZodJWT;

interface ZodBase64 extends ZodType<string, string> {}
interface ZodBase64URL extends ZodType<string, string> {}
interface ZodJWT extends ZodType<string, string> {}
```

**Examples:**
```typescript
const Base64Schema = z.base64();
Base64Schema.parse("SGVsbG8gV29ybGQ="); // Valid

const Base64URLSchema = z.base64url();

const JWTSchema = z.jwt();
JWTSchema.parse("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."); // Valid
```

## Phone & ID Formats

```typescript { .api }
/**
 * Create an E.164 phone number validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodE164 schema instance
 */
function e164(params?: { description?: string; errorMap?: ZodErrorMap }): ZodE164;

/**
 * Create a Nano ID validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodNanoID schema instance
 */
function nanoid(params?: { description?: string; errorMap?: ZodErrorMap }): ZodNanoID;

/**
 * Create a CUID validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodCUID schema instance
 */
function cuid(params?: { description?: string; errorMap?: ZodErrorMap }): ZodCUID;

/**
 * Create a CUID2 validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodCUID2 schema instance
 */
function cuid2(params?: { description?: string; errorMap?: ZodErrorMap }): ZodCUID2;

/**
 * Create a ULID validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodULID schema instance
 */
function ulid(params?: { description?: string; errorMap?: ZodErrorMap }): ZodULID;

/**
 * Create an XID validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodXID schema instance
 */
function xid(params?: { description?: string; errorMap?: ZodErrorMap }): ZodXID;

/**
 * Create a KSUID validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodKSUID schema instance
 */
function ksuid(params?: { description?: string; errorMap?: ZodErrorMap }): ZodKSUID;

interface ZodE164 extends ZodType<string, string> {}
interface ZodNanoID extends ZodType<string, string> {}
interface ZodCUID extends ZodType<string, string> {}
interface ZodCUID2 extends ZodType<string, string> {}
interface ZodULID extends ZodType<string, string> {}
interface ZodXID extends ZodType<string, string> {}
interface ZodKSUID extends ZodType<string, string> {}
```

**Examples:**
```typescript
const PhoneSchema = z.e164();
PhoneSchema.parse("+14155552671"); // Valid

const NanoIDSchema = z.nanoid();
const CUIDSchema = z.cuid();
const CUID2Schema = z.cuid2();
const ULIDSchema = z.ulid();
const XIDSchema = z.xid();
const KSUIDSchema = z.ksuid();
```

## Emoji & Custom Formats

```typescript { .api }
/**
 * Create an emoji validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodEmoji schema instance
 */
function emoji(params?: { description?: string; errorMap?: ZodErrorMap }): ZodEmoji;

/**
 * Create a hostname validation schema
 * @param params - Optional error message string or configuration parameters
 * @returns ZodCustomStringFormat for hostnames
 */
function hostname(params?: string | {
  message?: string;
  description?: string;
  errorMap?: ZodErrorMap
}): ZodCustomStringFormat<"hostname">;

/**
 * Create a hexadecimal string validation schema
 * @param params - Optional error message string or configuration parameters
 * @returns ZodCustomStringFormat for hex strings
 */
function hex(params?: string | {
  message?: string;
  description?: string;
  errorMap?: ZodErrorMap
}): ZodCustomStringFormat<"hex">;

/**
 * Create a hash format validation schema
 * @param alg - Hash algorithm type (e.g., "md5", "sha1", "sha256", "sha512")
 * @param params - Optional configuration with encoding and error parameters
 * @returns ZodCustomStringFormat with specific hash format type
 */
function hash<Alg extends HashAlgorithm, Enc extends HashEncoding = "hex">(
  alg: Alg,
  params?: {
    enc?: Enc;
    message?: string;
    description?: string;
    errorMap?: ZodErrorMap
  }
): ZodCustomStringFormat<`${Alg}_${Enc}`>;

/**
 * Create a custom string format validation schema with custom validation logic
 * @param format - Format name/identifier string
 * @param fnOrRegex - Validation function or regex pattern
 * @param params - Optional error message string or configuration parameters
 * @returns ZodCustomStringFormat schema instance
 */
function stringFormat<Format extends string>(
  format: Format,
  fnOrRegex: ((arg: string) => boolean | Promise<boolean>) | RegExp,
  params?: string | {
    message?: string;
    description?: string;
    errorMap?: ZodErrorMap
  }
): ZodCustomStringFormat<Format>;

type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";
type HashEncoding = "hex" | "base64";

interface ZodEmoji extends ZodType<string, string> {}
interface ZodCustomStringFormat<Format extends string = string> extends ZodType<string, string> {}
```

**Examples:**
```typescript
const EmojiSchema = z.emoji();
EmojiSchema.parse("😀"); // Valid
EmojiSchema.parse("hello"); // Invalid

const HostnameSchema = z.hostname();
HostnameSchema.parse("example.com"); // Valid

const HexSchema = z.hex();
HexSchema.parse("1a2b3c"); // Valid

const MD5Schema = z.hash("md5");
const SHA256Schema = z.hash("sha256", { enc: "hex" });

// Custom format with regex
const CustomFormatSchema = z.stringFormat(
  "custom",
  /^[A-Z]{3}-\d{3}$/,
  "Invalid format"
);

// Custom format with function
const AsyncValidatorSchema = z.stringFormat(
  "available-username",
  async (username) => {
    const available = await checkUsernameAvailability(username);
    return available;
  },
  "Username already taken"
);
```

## Common Patterns

```typescript
// User validation
const UserSchema = z.object({
  email: z.email().max(255),
  website: z.url().optional(),
  phone: z.e164().optional(),
});

// API validation
const APIKeySchema = z.object({
  key: z.uuid(),
  secret: z.base64(),
});

// Network validation
const ServerSchema = z.object({
  host: z.hostname(),
  ip: z.ipv4(),
  subnet: z.cidrv4().optional(),
});

// ID validation
const ResourceSchema = z.object({
  id: z.ulid(),
  userId: z.cuid2(),
  sessionId: z.nanoid(),
});
```
