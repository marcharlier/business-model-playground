# Date Parsing

Date parsing functions provide flexible conversion from strings to Date objects with support for various formats, ISO standards, and custom patterns. All parsing functions include proper error handling and validation.

## Core Parsing

### parse

Parse a date from a string using a format pattern.

```typescript { .api }
function parse(
  dateString: string,
  formatString: string,
  referenceDate: DateArg<Date>,
  options?: ParseOptions
): Date;
```

**Parameters:**
- `dateString` - The string to parse
- `formatString` - The format pattern to match
- `referenceDate` - Reference date for relative parsing
- `options` - Optional parsing configuration

**Format Tokens:**
- `yyyy` - 4-digit year
- `MM` - 2-digit month (01-12)
- `dd` - 2-digit day (01-31)
- `HH` - 24-hour format hour (00-23)
- `mm` - 2-digit minute (00-59)
- `ss` - 2-digit second (00-59)
- `SSS` - Milliseconds (000-999)

**Examples:**
```typescript
import { parse } from "date-fns";

// Basic date parsing
parse('2014-02-11', 'yyyy-MM-dd', new Date());
//=> Tue Feb 11 2014 00:00:00

// Date and time
parse('2014-02-11 14:30:45', 'yyyy-MM-dd HH:mm:ss', new Date());
//=> Tue Feb 11 2014 14:30:45

// Custom format
parse('11.02.2014', 'dd.MM.yyyy', new Date());
//=> Tue Feb 11 2014 00:00:00

// With milliseconds
parse('2014-02-11T14:30:45.123', 'yyyy-MM-ddTHH:mm:ss.SSS', new Date());
//=> Tue Feb 11 2014 14:30:45.123
```

### parseISO

Parse an ISO 8601 date string.

```typescript { .api }
function parseISO<ResultDate extends Date = Date>(
  argument: string,
  options?: ParseISOOptions<ResultDate>
): ResultDate;
```

**Parameters:**
- `argument` - The ISO 8601 string to parse
- `options` - Optional parsing configuration with additional digits support

**Supported Formats:**
- `YYYY-MM-DD` - Calendar date
- `YYYY-MM-DDTHH:mm:ss` - Complete date and time
- `YYYY-MM-DDTHH:mm:ss.sss` - With milliseconds
- `YYYY-MM-DDTHH:mm:ssZ` - UTC time
- `YYYY-MM-DDTHH:mm:ss+HH:mm` - With timezone offset

**Examples:**
```typescript
import { parseISO } from "date-fns";

// Date only
parseISO('2014-02-11');
//=> Tue Feb 11 2014 00:00:00

// Complete datetime
parseISO('2014-02-11T11:30:30');
//=> Tue Feb 11 2014 11:30:30

// With timezone
parseISO('2014-02-11T11:30:30+05:00');
//=> Tue Feb 11 2014 11:30:30

// UTC time
parseISO('2014-02-11T11:30:30Z');
//=> Tue Feb 11 2014 11:30:30

// With milliseconds
parseISO('2014-02-11T11:30:30.123Z');
//=> Tue Feb 11 2014 11:30:30.123
```

### parseJSON

Parse a date from JSON (handles various JSON date formats).

```typescript { .api }
function parseJSON<ResultDate extends Date = Date>(
  dateStr: string,
  options?: ParseJSONOptions<ResultDate>
): ResultDate;
```

**Parameters:**
- `dateStr` - The JSON date string to parse
- `options` - Optional parsing configuration with context support

**Examples:**
```typescript
import { parseJSON } from "date-fns";

// ISO string from JSON
parseJSON('2014-02-11T11:30:30.000Z');
//=> Tue Feb 11 2014 11:30:30

// Unix timestamp
parseJSON(1392123030000);
//=> Tue Feb 11 2014 11:30:30

// Already a Date object
parseJSON(new Date(2014, 1, 11));
//=> Tue Feb 11 2014 00:00:00
```

## Validation and Matching

### isMatch

Check if a string matches a date format pattern.

```typescript { .api }
function isMatch(
  dateString: string,
  formatString: string,
  options?: MatchOptions
): boolean;
```

**Parameters:**
- `dateString` - The string to test
- `formatString` - The format pattern to match against
- `options` - Optional matching configuration

**Examples:**
```typescript
import { isMatch } from "date-fns";

// Valid formats
isMatch('2014-02-11', 'yyyy-MM-dd');
//=> true

isMatch('11.02.2014', 'dd.MM.yyyy');
//=> true

// Invalid formats
isMatch('2014-02-11', 'dd.MM.yyyy');
//=> false

isMatch('not-a-date', 'yyyy-MM-dd');
//=> false

// Complex patterns
isMatch('2014-02-11 14:30:45', 'yyyy-MM-dd HH:mm:ss');
//=> true
```

## Advanced Parsing Patterns

### Date Parts Parsing

Parse dates with various separators and formats:

```typescript
import { parse } from "date-fns";

// Different separators
parse('2014/02/11', 'yyyy/MM/dd', new Date());
parse('2014-02-11', 'yyyy-MM-dd', new Date());
parse('2014.02.11', 'yyyy.MM.dd', new Date());

// Different order
parse('11/02/2014', 'dd/MM/yyyy', new Date());
parse('02/11/2014', 'MM/dd/yyyy', new Date());

// Short year
parse('14-02-11', 'yy-MM-dd', new Date());
```

### Time Parsing

Parse various time formats:

```typescript
import { parse } from "date-fns";

// 24-hour format
parse('14:30:45', 'HH:mm:ss', new Date());

// 12-hour format with AM/PM
parse('2:30:45 PM', 'h:mm:ss a', new Date());

// Minutes and seconds only
parse('30:45', 'mm:ss', new Date());

// With milliseconds
parse('14:30:45.123', 'HH:mm:ss.SSS', new Date());
```

### Relative Date Parsing

Use reference date for context-dependent parsing:

```typescript
import { parse } from "date-fns";

const referenceDate = new Date(2020, 0, 1); // Jan 1, 2020

// Parse relative to reference year
parse('02-11', 'MM-dd', referenceDate);
//=> Feb 11, 2020

// Day of year
parse('42', 'D', referenceDate);
//=> Feb 11, 2020 (42nd day of 2020)
```

## Error Handling

### Invalid Date Detection

```typescript
import { parse, isValid } from "date-fns";

// Parse potentially invalid date
const result = parse('invalid-date', 'yyyy-MM-dd', new Date());

// Check if parsing was successful
if (isValid(result)) {
  console.log('Parsed successfully:', result);
} else {
  console.log('Parsing failed');
}

// Parse with validation
function safeParse(dateString: string, format: string): Date | null {
  try {
    const parsed = parse(dateString, format, new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
```

### Common Parsing Pitfalls

```typescript
import { parse, parseISO } from "date-fns";

// Ambiguous formats - be explicit
parse('01/02/2014', 'MM/dd/yyyy', new Date()); // Jan 2, 2014
parse('01/02/2014', 'dd/MM/yyyy', new Date()); // Feb 1, 2014

// Timezone handling
parseISO('2014-02-11T11:30:30'); // Local time
parseISO('2014-02-11T11:30:30Z'); // UTC time

// Invalid dates return Invalid Date
parse('2014-13-01', 'yyyy-MM-dd', new Date()); // Invalid Date
parse('2014-02-30', 'yyyy-MM-dd', new Date()); // Invalid Date
```

## Option Types

### ParseOptions

```typescript { .api }
interface ParseOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}
```

### MatchOptions

```typescript { .api }
interface MatchOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}
```

### ParseISOOptions

```typescript { .api }
interface ParseISOOptions<DateType extends Date = Date> extends ContextOptions<DateType> {
  additionalDigits?: 0 | 1 | 2;
}
```

### ParseJSONOptions

```typescript { .api }
interface ParseJSONOptions<DateType extends Date = Date> extends ContextOptions<DateType> {}
```

## Format Token Reference

### Date Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `yyyy` | 4-digit year | 2014 |
| `yy` | 2-digit year | 14 |
| `y` | Year | 2014 |
| `YYYY` | ISO week year | 2014 |
| `YY` | 2-digit ISO week year | 14 |

### Month Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `MMMM` | Full month name | February |
| `MMM` | Short month name | Feb |
| `MM` | 2-digit month | 02 |
| `M` | Month | 2 |

### Day Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `dd` | 2-digit day | 11 |
| `d` | Day | 11 |
| `D` | Day of year | 42 |
| `EEEE` | Full day name | Tuesday |
| `EEE` | Short day name | Tue |
| `e` | Local day of week | 2 |
| `i` | ISO day of week | 2 |

### Time Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `HH` | 24-hour hour | 14 |
| `H` | 24-hour hour | 14 |
| `hh` | 12-hour hour | 02 |
| `h` | 12-hour hour | 2 |
| `mm` | 2-digit minute | 30 |
| `m` | Minute | 30 |
| `ss` | 2-digit second | 45 |
| `s` | Second | 45 |
| `SSS` | Millisecond | 123 |
| `S` | 1/10 second | 1 |
| `SS` | 1/100 second | 12 |

### AM/PM and Timezone

| Token | Description | Example |
|-------|-------------|---------|
| `a` | AM/PM | PM |
| `aa` | AM/PM | PM |
| `aaa` | AM/PM | PM |
| `X` | Timezone offset | +0200 |
| `XX` | Timezone offset | +02:00 |
| `XXX` | Timezone offset | +02:00 |