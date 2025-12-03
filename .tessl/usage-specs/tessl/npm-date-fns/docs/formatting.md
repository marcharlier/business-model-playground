# Date Formatting

Date formatting functions provide comprehensive date-to-string conversion capabilities with extensive customization options, internationalization support, and multiple output formats. All formatting functions are pure and work with various date input types.

## Core Formatting

### format

Format a date according to a given pattern string.

```typescript { .api }
function format(
  date: DateArg<Date>,
  formatStr: string,
  options?: FormatOptions
): string;
```

**Parameters:**
- `date` - The date to format
- `formatStr` - The format pattern string
- `options` - Optional formatting configuration

**Format Tokens:**
- `yyyy` - 4-digit year
- `MM` - 2-digit month (01-12)
- `dd` - 2-digit day (01-31)
- `HH` - 24-hour format hour (00-23)
- `mm` - 2-digit minute (00-59)
- `ss` - 2-digit second (00-59)
- `PP` - Localized date (Jan 1, 2023)
- `pp` - Localized time (12:00 AM)

**Examples:**
```typescript
import { format } from "date-fns";

// Basic formatting
format(new Date(2014, 1, 11), "yyyy-MM-dd");
//=> '2014-02-11'

// Full date with time
format(new Date(2014, 1, 11, 14, 30, 45), "yyyy-MM-dd HH:mm:ss");
//=> '2014-02-11 14:30:45'

// Localized format
format(new Date(2014, 1, 11), "PP");
//=> 'Feb 11, 2014'

// Custom pattern
format(new Date(2014, 1, 11), "EEEE, MMMM do, yyyy");
//=> 'Tuesday, February 11th, 2014'
```

### lightFormat

Lightweight format without locale support for better performance.

```typescript { .api }
function lightFormat(date: DateArg<Date>, formatStr: string): string;
```

**Example:**
```typescript
import { lightFormat } from "date-fns";

lightFormat(new Date(2014, 1, 11), "yyyy-MM-dd");
//=> '2014-02-11'
```

## Distance Formatting

### formatDistance

Format the distance between two dates in words.

```typescript { .api }
function formatDistance(
  dateLeft: DateArg<Date>,
  dateRight: DateArg<Date>,
  options?: FormatDistanceOptions
): string;
```

**Parameters:**
- `dateLeft` - The first date
- `dateRight` - The second date
- `options` - Distance formatting options

**Examples:**
```typescript
import { formatDistance } from "date-fns";

// Basic distance
formatDistance(
  new Date(2014, 6, 2),
  new Date(2015, 0, 1)
);
//=> '6 months'

// With suffix
formatDistance(
  new Date(2014, 6, 2),
  new Date(2015, 0, 1),
  { addSuffix: true }
);
//=> 'in 6 months'

// Include seconds
formatDistance(
  new Date(2014, 6, 2, 0, 0, 15),
  new Date(2014, 6, 2, 0, 0, 0),
  { includeSeconds: true }
);
//=> 'less than 20 seconds'
```

### formatDistanceStrict

Format distance with strict units (no rounding to nearest unit).

```typescript { .api }
function formatDistanceStrict(
  dateLeft: DateArg<Date>,
  dateRight: DateArg<Date>,
  options?: FormatDistanceStrictOptions
): string;
```

**Example:**
```typescript
import { formatDistanceStrict } from "date-fns";

formatDistanceStrict(
  new Date(2014, 6, 2, 0, 5),
  new Date(2014, 6, 2, 0, 0)
);
//=> '5 minutes'
```

### formatDistanceToNow

Format the distance between a date and now.

```typescript { .api }
function formatDistanceToNow(
  date: DateArg<Date>,
  options?: FormatDistanceOptions
): string;
```

**Example:**
```typescript
import { formatDistanceToNow } from "date-fns";

formatDistanceToNow(new Date(2014, 6, 2), { addSuffix: true });
//=> '8 years ago' (assuming current date is 2022)
```

### formatDistanceToNowStrict

Strict distance formatting to current time.

```typescript { .api }
function formatDistanceToNowStrict(
  date: DateArg<Date>,
  options?: FormatDistanceStrictOptions
): string;
```

## Relative Formatting

### formatRelative

Format a date relative to a base date (e.g., "yesterday", "last Friday").

```typescript { .api }
function formatRelative(
  date: DateArg<Date>,
  baseDate: DateArg<Date>,
  options?: FormatRelativeOptions
): string;
```

**Examples:**
```typescript
import { formatRelative } from "date-fns";

const baseDate = new Date(2000, 0, 1, 0, 0, 0);

// Yesterday
formatRelative(new Date(1999, 11, 31), baseDate);
//=> 'yesterday at 12:00 AM'

// Last week
formatRelative(new Date(1999, 11, 27), baseDate);
//=> 'last Monday at 12:00 AM'

// Next week
formatRelative(new Date(2000, 0, 7), baseDate);
//=> 'next Friday at 12:00 AM'
```

## ISO and Standard Formats

### formatISO

Format a date as ISO 8601 string.

```typescript { .api }
function formatISO(date: DateArg<Date>, options?: FormatISOOptions): string;
```

**Options:**
- `representation` - 'complete' | 'date' | 'time'
- `format` - 'extended' | 'basic'

**Examples:**
```typescript
import { formatISO } from "date-fns";

// Complete ISO format
formatISO(new Date(2019, 8, 18, 19, 0, 52));
//=> '2019-09-18T19:00:52+02:00'

// Date only
formatISO(new Date(2019, 8, 18), { representation: 'date' });
//=> '2019-09-18'

// Basic format
formatISO(new Date(2019, 8, 18), { format: 'basic' });
//=> '20190918T190052+0200'
```

### formatISO9075

Format a date as ISO 9075 string (SQL compatible).

```typescript { .api }
function formatISO9075(date: DateArg<Date>, options?: FormatISOOptions): string;
```

**Example:**
```typescript
import { formatISO9075 } from "date-fns";

formatISO9075(new Date(2019, 8, 18, 19, 0, 52));
//=> '2019-09-18 19:00:52'
```

### formatRFC3339

Format a date as RFC 3339 string.

```typescript { .api }
function formatRFC3339(date: DateArg<Date>, options?: FormatRFC3339Options): string;
```

**Example:**
```typescript
import { formatRFC3339 } from "date-fns";

formatRFC3339(new Date(2019, 8, 18, 19, 0, 52));
//=> '2019-09-18T19:00:52+02:00'
```

### formatRFC7231

Format a date as RFC 7231 string (HTTP date).

```typescript { .api }
function formatRFC7231(date: DateArg<Date>): string;
```

**Example:**
```typescript
import { formatRFC7231 } from "date-fns";

formatRFC7231(new Date(2014, 11, 6, 15, 45));
//=> 'Sat, 06 Dec 2014 15:45:00 GMT'
```

## Duration Formatting

### formatDuration

Format a duration object into a human-readable string.

```typescript { .api }
function formatDuration(
  duration: Duration,
  options?: FormatDurationOptions
): string;
```

**Examples:**
```typescript
import { formatDuration } from "date-fns";

// Basic duration
formatDuration({
  years: 2,
  months: 9,
  weeks: 1,
  days: 7,
  hours: 5,
  minutes: 9,
  seconds: 30
});
//=> '2 years 9 months 1 week 7 days 5 hours 9 minutes 30 seconds'

// With custom format
formatDuration({ hours: 1, minutes: 30 }, { format: ['hours', 'minutes'] });
//=> '1 hour 30 minutes'
```

### formatISODuration

Format a duration as ISO 8601 duration string.

```typescript { .api }
function formatISODuration(duration: Duration): string;
```

**Example:**
```typescript
import { formatISODuration } from "date-fns";

formatISODuration({
  years: 2,
  months: 9,
  weeks: 1,
  days: 7,
  hours: 5,
  minutes: 9,
  seconds: 30
});
//=> 'P2Y9M1W7DT5H9M30S'
```

## Internationalization Formatting

### intlFormat

Format a date using the Intl.DateTimeFormat API.

```typescript { .api }
function intlFormat(
  date: DateArg<Date>,
  formatOptions?: Intl.DateTimeFormatOptions,
  localeOptions?: string | string[]
): string;
```

**Examples:**
```typescript
import { intlFormat } from "date-fns";

// Default format
intlFormat(new Date(2019, 0, 1));
//=> '1/1/2019'

// Custom format
intlFormat(new Date(2019, 0, 1), {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
//=> 'January 1, 2019'

// Different locale
intlFormat(new Date(2019, 0, 1), {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}, 'de-DE');
//=> '1. Januar 2019'
```

### intlFormatDistance

Format distance using the Intl.RelativeTimeFormat API.

```typescript { .api }
function intlFormatDistance(
  dateLeft: DateArg<Date>,
  dateRight: DateArg<Date>,
  options?: IntlFormatDistanceOptions
): string;
```

**Example:**
```typescript
import { intlFormatDistance } from "date-fns";

intlFormatDistance(
  new Date(1986, 3, 4, 11, 30, 0),
  new Date(1986, 3, 4, 10, 30, 0),
  { locale: 'en-US' }
);
//=> 'in 1 hour'
```

## Option Types

### FormatOptions

```typescript { .api }
interface FormatOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}
```

### FormatDistanceOptions

```typescript { .api }
interface FormatDistanceOptions {
  includeSeconds?: boolean;
  addSuffix?: boolean;
  locale?: Locale;
}
```

### FormatDistanceStrictOptions

```typescript { .api }
interface FormatDistanceStrictOptions {
  addSuffix?: boolean;
  unit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
  roundingMethod?: 'floor' | 'ceil' | 'round';
  locale?: Locale;
}
```

### FormatRelativeOptions

```typescript { .api }
interface FormatRelativeOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
```

### FormatISOOptions

```typescript { .api }
interface FormatISOOptions {
  format?: 'extended' | 'basic';
  representation?: 'complete' | 'date' | 'time';
}
```

### FormatRFC3339Options

```typescript { .api }
interface FormatRFC3339Options {
  fractionDigits?: 0 | 1 | 2 | 3;
}
```

### FormatDurationOptions

```typescript { .api }
interface FormatDurationOptions {
  format?: DurationUnit[];
  zero?: boolean;
  delimiter?: string;
  locale?: Locale;
}
```

### IntlFormatDistanceOptions

```typescript { .api }
interface IntlFormatDistanceOptions {
  locale?: string | string[];
  unit?: Intl.RelativeTimeFormatUnit;
  localeMatcher?: 'lookup' | 'best fit';
  numeric?: 'always' | 'auto';
  style?: 'long' | 'short' | 'narrow';
}
```