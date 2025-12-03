# date-fns

date-fns provides the most comprehensive, yet simple and consistent toolset for manipulating JavaScript dates in both browser and Node.js environments. It offers over 200 modular functions for all date manipulation needs, supporting tree-shaking and selective imports to minimize bundle size.

## Package Information

- **Package Name**: date-fns
- **Package Type**: npm
- **Language**: JavaScript/TypeScript
- **Installation**: `npm install date-fns`

## Core Imports

```typescript
import { format, addDays, differenceInDays, isValid } from "date-fns";
```

For CommonJS:

```javascript
const { format, addDays, differenceInDays, isValid } = require("date-fns");
```

Individual function imports (recommended for tree-shaking):

```typescript
import { format } from "date-fns/format";
import { addDays } from "date-fns/addDays";
```

Constants import:

```typescript
import { maxTime, minTime } from "date-fns/constants";
```

Locale imports:

```typescript
import { enUS, de, fr } from "date-fns/locale";
```

## Basic Usage

```typescript
import { compareAsc, format } from "date-fns";

// Format dates
format(new Date(2014, 1, 11), "yyyy-MM-dd");
//=> '2014-02-11'

// Add days and format
const futureDate = addDays(new Date(2023, 0, 1), 10);
format(futureDate, "PP");
//=> 'Jan 11, 2023'

// Compare dates
const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];
dates.sort(compareAsc);
//=> Sorted chronologically

// Validate dates
isValid(new Date("2023-13-01")); //=> false
isValid(new Date("2023-01-01")); //=> true
```

## Architecture

date-fns is built around several key principles:

- **Immutable & Pure**: All functions are pure and return new date instances without modifying inputs
- **Modular Design**: Each function is a separate module enabling tree-shaking and selective imports
- **TypeScript First**: Complete type definitions with generic support for custom date types
- **No Extensions**: Uses native Date objects without extending prototypes for maximum compatibility
- **Functional Programming**: Optional FP module with curried interfaces for functional composition
- **Internationalization**: Comprehensive locale system supporting 97+ languages and regions

## Capabilities

### Date Arithmetic

Core date manipulation functions for adding, subtracting, and calculating differences between dates. Essential for date calculations and scheduling applications.

```typescript { .api }
function add(date: DateArg<DateType>, duration: Duration): DateType;
function addDays(date: DateArg<DateType>, amount: number): DateType;
function differenceInDays(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): number;
function sub(date: DateArg<DateType>, duration: Duration): DateType;
```

[Date Arithmetic](./arithmetic.md)

### Date Formatting

Comprehensive date formatting with customizable patterns, internationalization support, and multiple output formats including ISO, RFC, and relative time formatting.

```typescript { .api }
function format(date: DateArg<Date>, formatStr: string, options?: FormatOptions): string;
function formatDistance(dateLeft: DateArg<Date>, dateRight: DateArg<Date>, options?: FormatDistanceOptions): string;
function formatISO(date: DateArg<Date>, options?: FormatISOOptions): string;
function formatRelative(date: DateArg<Date>, baseDate: DateArg<Date>, options?: FormatRelativeOptions): string;
```

[Date Formatting](./formatting.md)

### Date Parsing

Flexible date parsing from strings, ISO formats, and custom patterns with proper error handling and validation support.

```typescript { .api }
function parse(dateString: string, formatString: string, referenceDate: DateArg<Date>, options?: ParseOptions): Date;
function parseISO(argument: string, options?: ParseOptions): Date;
function parseJSON(argument: string | number | Date): Date;
function isMatch(dateString: string, formatString: string, options?: MatchOptions): boolean;
```

[Date Parsing](./parsing.md)

### Date Validation and Comparison

Comprehensive validation and comparison utilities for checking date validity, temporal relationships, and period-based comparisons.

```typescript { .api }
function isValid(date: any): boolean;
function isAfter(date: DateArg<Date>, dateToCompare: DateArg<Date>): boolean;
function isBefore(date: DateArg<Date>, dateToCompare: DateArg<Date>): boolean;
function isEqual(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function compareAsc(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): number;
```

[Date Validation](./validation.md)

### Date Component Access

Functions for getting and setting individual date components (year, month, day, hour, etc.) with proper handling of time zones and edge cases.

```typescript { .api }
function getYear(date: DateArg<Date>): number;
function getMonth(date: DateArg<Date>): number;
function getDate(date: DateArg<Date>): number;
function setYear<DateType extends Date>(date: DateArg<DateType>, year: number): DateType;
function setMonth<DateType extends Date>(date: DateArg<DateType>, month: number): DateType;
```

[Date Components](./components.md)

### Time Period Utilities

Functions for working with specific time periods like start/end of day, week, month, and iteration over date ranges.

```typescript { .api }
function startOfDay<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfMonth<DateType extends Date>(date: DateArg<DateType>): DateType;
function eachDayOfInterval(interval: Interval, options?: StepOptions): Date[];
function lastDayOfMonth<DateType extends Date>(date: DateArg<DateType>): DateType;
```

[Time Periods](./periods.md)

### Internationalization

Complete locale system supporting 97+ languages and regions with customizable date formatting, relative time display, and cultural date conventions.

```typescript { .api }
interface Locale {
  code: string;
  formatDistance: FormatDistanceFn;
  formatLong: FormatLongOptions;
  formatRelative: FormatRelativeFn;
  localize: LocalizeOptions;
  match: MatchOptions;
  options?: LocaleOptions;
}
```

[Internationalization](./i18n.md)

### Constants and Utilities

Mathematical constants for time calculations, utility functions for date construction, and helper functions for common operations.

```typescript { .api }
const daysInWeek = 7;
const millisecondsInDay = 86400000;
const maxTime = 8640000000000000;
function toDate(argument: DateArg<Date>): Date;
function isDate(value: any): value is Date;
```

[Constants and Utilities](./constants.md)

### Functional Programming

Curried function interfaces for functional composition and pipeline-style date operations, with automatic parameter reordering for optimal usage.

```typescript { .api }
const add: CurriedFn2<Duration, DateArg<Date>, Date>;
const format: CurriedFn2<string, DateArg<Date>, string>;
const isAfter: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
```

[Functional Programming](./fp.md)

## Types

### Core Types

```typescript { .api }
type DateArg<DateType extends Date> = DateType | number | string;

interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface Interval {
  start: DateArg<Date>;
  end: DateArg<Date>;
}

interface GenericDateConstructor<DateType extends Date = Date> {
  new (): DateType;
  new (value: DateArg<Date> & {}): DateType;
  new (
    year: number,
    month: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number,
  ): DateType;
}
```

### Options Interfaces

```typescript { .api }
interface FormatOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}

interface ParseOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}

interface StepOptions {
  step?: number;
}
```