# ISO DateTime Schemas

ISO 8601 date/time string validators for datetime, date, time, and duration formats.

## ISO Namespace

```typescript { .api }
namespace iso {
  function datetime(params?: ISODateTimeParams): ZodISODateTime;
  function date(params?: ISOParams): ZodISODate;
  function time(params?: ISOParams): ZodISOTime;
  function duration(params?: ISOParams): ZodISODuration;
}

interface ISODateTimeParams {
  precision?: number;
  offset?: boolean;
  local?: boolean;
  description?: string;
  errorMap?: ZodErrorMap;
}

interface ISOParams {
  description?: string;
  errorMap?: ZodErrorMap;
}
```

## ISO DateTime

```typescript
z.iso.datetime()
// Validates ISO 8601 datetime strings

z.iso.datetime().parse("2024-01-01T12:00:00Z");           // Valid
z.iso.datetime().parse("2024-01-01T12:00:00.123Z");       // Valid
z.iso.datetime().parse("2024-01-01T12:00:00+05:30");      // Valid

// With precision
z.iso.datetime({ precision: 3 })  // Millisecond precision
z.iso.datetime({ precision: 0 })  // No fractional seconds

// Offset handling
z.iso.datetime({ offset: true })   // Require timezone offset
z.iso.datetime({ offset: false })  // Disallow timezone offset
z.iso.datetime({ local: true })    // Local time (no Z or offset)

// Examples
z.iso.datetime({ precision: 3 }).parse("2024-01-01T12:00:00.123Z");  // Valid
z.iso.datetime({ offset: false }).parse("2024-01-01T12:00:00");      // Valid
z.iso.datetime({ local: true }).parse("2024-01-01T12:00:00");        // Valid
```

## ISO Date

```typescript
z.iso.date()
// Validates ISO 8601 date strings (YYYY-MM-DD)

z.iso.date().parse("2024-01-01");  // Valid
z.iso.date().parse("2024-12-31");  // Valid
z.iso.date().parse("2024/01/01");  // Invalid
```

## ISO Time

```typescript
z.iso.time()
// Validates ISO 8601 time strings (HH:mm:ss or HH:mm:ss.SSS)

z.iso.time().parse("12:00:00");       // Valid
z.iso.time().parse("23:59:59");       // Valid
z.iso.time().parse("12:00:00.123");   // Valid
z.iso.time().parse("12:00:00Z");      // Valid (with timezone)
z.iso.time().parse("12:00:00+05:30"); // Valid (with offset)
```

## ISO Duration

```typescript
z.iso.duration()
// Validates ISO 8601 duration strings (PnYnMnDTnHnMnS)

z.iso.duration().parse("P1Y");           // 1 year
z.iso.duration().parse("P1M");           // 1 month
z.iso.duration().parse("P1D");           // 1 day
z.iso.duration().parse("PT1H");          // 1 hour
z.iso.duration().parse("PT1M");          // 1 minute
z.iso.duration().parse("PT1S");          // 1 second
z.iso.duration().parse("P1Y2M3DT4H5M6S"); // Combined
z.iso.duration().parse("PT30M");         // 30 minutes
```

## Common Patterns

```typescript
// Event schema
const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  date: z.iso.date(),
});

// API timestamp fields
const APISchema = z.object({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  publishDate: z.iso.date().optional(),
});

// Schedule
const ScheduleSchema = z.object({
  date: z.iso.date(),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  duration: z.iso.duration().optional(),
});

// Meeting
const MeetingSchema = z.object({
  title: z.string(),
  scheduledAt: z.iso.datetime({ offset: true }),
  duration: z.iso.duration(),
  timezone: z.string(),
});

// Log entry
const LogSchema = z.object({
  timestamp: z.iso.datetime({ precision: 3 }),
  level: z.enum(["info", "warn", "error"]),
  message: z.string(),
});
```

## Transformation to Date Objects

```typescript
// Parse ISO string and convert to Date
const DateTimeSchema = z.iso.datetime().transform((str) => new Date(str));

const result = DateTimeSchema.parse("2024-01-01T12:00:00Z");
// result is a Date object

// With validation
const FutureDateSchema = z.iso.datetime()
  .transform((str) => new Date(str))
  .refine((date) => date > new Date(), "Must be in the future");

// Combined schema
const EventWithDatesSchema = z.object({
  name: z.string(),
  startDate: z.iso.datetime().transform((s) => new Date(s)),
  endDate: z.iso.datetime().transform((s) => new Date(s)),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
);
```

## ISO vs Date Schema

```typescript
// ISO datetime string
z.iso.datetime()
// Input: "2024-01-01T12:00:00Z" (string)
// Output: "2024-01-01T12:00:00Z" (string)

// Date object
z.date()
// Input: Date object
// Output: Date object

// Coerced date
z.coerce.date()
// Input: anything (string, number, Date)
// Output: Date object

// ISO with transformation
z.iso.datetime().transform((s) => new Date(s))
// Input: "2024-01-01T12:00:00Z" (string)
// Output: Date object
```
