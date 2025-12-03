# Constants and Utilities

Constants and utility functions provide mathematical constants for time calculations, utility functions for date construction, and helper functions for common operations. These form the foundation of date-fns functionality.

## Time Constants

### Basic Time Units

```typescript { .api }
const millisecondsInSecond: number = 1000;
const millisecondsInMinute: number = 60000;
const millisecondsInHour: number = 3600000;
const millisecondsInDay: number = 86400000;
const millisecondsInWeek: number = 604800000;
```

**Usage:**
```typescript
import { millisecondsInDay, millisecondsInHour } from "date-fns/constants";

// Calculate milliseconds for custom durations
const threeDaysInMs = 3 * millisecondsInDay;
const sixHoursInMs = 6 * millisecondsInHour;

// Convert millisecond differences to days
const msDifference = date2.getTime() - date1.getTime();
const daysDifference = msDifference / millisecondsInDay;
```

### Duration Constants

```typescript { .api }
const secondsInMinute: number = 60;
const secondsInHour: number = 3600;
const secondsInDay: number = 86400;
const secondsInWeek: number = 604800;
const secondsInMonth: number = 2629800; // Average month (secondsInYear / 12)
const secondsInQuarter: number = 7889400; // Average quarter (secondsInMonth * 3)
const secondsInYear: number = 31557600; // Average year (secondsInDay * daysInYear)
```

**Examples:**
```typescript
import { secondsInDay, secondsInHour } from "date-fns/constants";

// Calculate time intervals
const workingHoursPerDay = 8;
const workingSecondsPerDay = workingHoursPerDay * secondsInHour;

// Convert Unix timestamps
const unixTimestamp = Date.now() / 1000;
const daysFromEpoch = unixTimestamp / secondsInDay;
```

### Calendar Constants

```typescript { .api }
const minutesInHour: number = 60;
const minutesInDay: number = 1440;
const minutesInMonth: number = 43200; // Average month
const minutesInYear: number = 525600; // Average year

const daysInWeek: number = 7;
const daysInYear: number = 365.2425; // Average with leap years

const monthsInQuarter: number = 3;
const monthsInYear: number = 12;
const quartersInYear: number = 4;
```

**Examples:**
```typescript
import { daysInWeek, monthsInYear, quartersInYear } from "date-fns/constants";

// Calculate periods
const weeksInYear = daysInYear / daysInWeek; // ~52.18
const monthsInTwoYears = 2 * monthsInYear; // 24
const quartersInFiveYears = 5 * quartersInYear; // 20
```

### Boundary Constants

```typescript { .api }
const maxTime: number = 8640000000000000;
const minTime: number = -8640000000000000;
```

These represent the maximum and minimum valid JavaScript Date values.

**Examples:**
```typescript
import { maxTime, minTime } from "date-fns/constants";

// Create boundary dates
const maxDate = new Date(maxTime);
//=> Sat Sep 13 275760 02:00:00 (maximum valid date)

const minDate = new Date(minTime);
//=> Tue Apr 20 -271821 02:00:00 (minimum valid date)

// Validate date ranges
function isValidDateRange(date: Date): boolean {
  const time = date.getTime();
  return time >= minTime && time <= maxTime;
}
```

### Construction Symbol

```typescript { .api }
const constructFromSymbol: unique symbol = Symbol.for("constructDateFrom");
```

Internal symbol used for date constructor injection in generic date types and extensions like UTCDate.

## Core Utility Functions

### Date Construction

```typescript { .api }
function toDate<DateType extends Date>(
  argument: DateArg<DateType>,
  context?: ContextFn<DateType>
): DateType;

function constructFrom<DateType extends Date>(
  date: DateArg<DateType> | ContextFn<DateType>,
  value: DateArg<Date>
): DateType;

function constructNow<DateType extends Date>(
  date: DateArg<DateType> | ContextFn<DateType>
): DateType;
```

**Examples:**
```typescript
import { toDate, constructFrom, constructNow } from "date-fns";

// Convert various inputs to Date
toDate(new Date(2014, 1, 11)); //=> Date object
toDate('2014-02-11'); //=> Date object
toDate(1392076800000); //=> Date object

// Construct date with same type as reference
const utcDate = new UTCDate(2014, 1, 11);
const newUTCDate = constructFrom(utcDate, '2015-02-11');
//=> UTCDate instance

// Construct "now" with same type as reference
const nowUTC = constructNow(utcDate);
//=> UTCDate instance of current time
```

The `toDate` function is the core conversion utility that all date-fns functions use internally. It converts any DateArg input to a proper Date instance, enabling automatic handling of timestamps, date strings, and existing Date objects.

The `constructFrom` function enables generic date construction, preserving the type of the reference date. This is crucial for working with date extensions like UTCDate or TZDate.

The `constructNow` function creates a new date representing the current time, but using the same constructor type as the reference date.

### Date Validation

```typescript { .api }
function isDate(value: any): value is Date;
function isValid(date: any): boolean;
```

**Examples:**
```typescript
import { isDate, isValid } from "date-fns";

// Type checking
isDate(new Date()); //=> true
isDate('2014-02-11'); //=> false
isDate(null); //=> false

// Validity checking  
isValid(new Date(2014, 1, 11)); //=> true
isValid(new Date('invalid')); //=> false
isValid(new Date(2014, 13, 1)); //=> false (invalid month)
```

### Unix Time Utilities

```typescript { .api }
function fromUnixTime(unixTime: number): Date;
function getUnixTime(date: DateArg<Date>): number;
```

**Examples:**
```typescript
import { fromUnixTime, getUnixTime } from "date-fns";

// Convert from Unix timestamp (seconds since epoch)
fromUnixTime(1392123045);
//=> Tue Feb 11 2014 11:30:45

// Convert to Unix timestamp
getUnixTime(new Date(2014, 1, 11, 11, 30, 45));
//=> 1392123045
```

## Interval Utilities

### Interval Construction

```typescript { .api }
function interval(start: DateArg<Date>, end: DateArg<Date>): Interval;
```

**Example:**
```typescript
import { interval } from "date-fns";

const dateInterval = interval(
  new Date(2014, 0, 1),
  new Date(2014, 0, 7)
);
//=> { start: Date(2014-01-01), end: Date(2014-01-07) }
```

### Duration Conversion

```typescript { .api }
function intervalToDuration(interval: Interval): Duration;
function milliseconds(duration: Duration): number;
```

**Examples:**
```typescript
import { intervalToDuration, milliseconds } from "date-fns";

// Convert interval to duration object
const duration = intervalToDuration({
  start: new Date(2014, 0, 1, 0, 0, 0),
  end: new Date(2014, 0, 1, 1, 30, 15)
});
//=> { hours: 1, minutes: 30, seconds: 15 }

// Get total milliseconds from duration
const totalMs = milliseconds({
  hours: 2,
  minutes: 30,
  seconds: 45
});
//=> 9045000 (2.5 hours + 45 seconds in milliseconds)
```

### Date Clamping

```typescript { .api }
function clamp<DateType extends Date>(
  date: DateArg<DateType>,
  interval: Interval
): DateType;
```

**Example:**
```typescript
import { clamp } from "date-fns";

// Clamp date to fit within bounds
clamp(new Date(2014, 0, 1), {
  start: new Date(2014, 0, 5),
  end: new Date(2014, 0, 10)
});
//=> Date(2014-01-05) (clamped to start bound)

clamp(new Date(2014, 0, 15), {
  start: new Date(2014, 0, 5),
  end: new Date(2014, 0, 10)
});
//=> Date(2014-01-10) (clamped to end bound)
```

## Type Transformation

### Date Transposition

```typescript { .api }
function transpose<InputDate extends Date, ResultDate extends Date>(
  date: InputDate,
  constructor: ResultDate | GenericDateConstructor<ResultDate> | ContextFn<ResultDate>
): ResultDate;
```

**Examples:**
```typescript
import { transpose } from "date-fns";

// Convert between different date types
const regularDate = new Date(2022, 6, 10); // July 10, 2022 00:00 in local time
const utcDate = transpose(regularDate, UTCDate);
//=> UTCDate instance: 'Sun Jul 10 2022 00:00:00 GMT+0000 (UTC)'

// Transpose to custom date extension
const tzDate = transpose(regularDate, TZDate);
//=> TZDate instance maintaining the date values in the target timezone
```

The `transpose` function is essential for working with date extensions. Unlike simple conversion, it preserves the date values (year, month, day, hour, etc.) while changing the underlying date type. This is particularly useful when moving between different timezone representations or date implementations.

## Mathematical Utilities

### Time Calculations

```typescript
import { millisecondsInDay, secondsInHour, minutesInDay } from "date-fns/constants";

// Calculate elapsed time
function getElapsedDays(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / millisecondsInDay;
}

// Convert between units
function hoursToMinutes(hours: number): number {
  return hours * minutesInHour;
}

function daysToSeconds(days: number): number {
  return days * secondsInDay;
}
```

### Age Calculations

```typescript
import { daysInYear } from "date-fns/constants";

function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  const diffMs = referenceDate.getTime() - birthDate.getTime();
  const diffDays = diffMs / millisecondsInDay;
  return Math.floor(diffDays / daysInYear);
}
```

## Performance Optimizations

### Constant-Based Calculations

```typescript
import { millisecondsInDay, secondsInHour } from "date-fns/constants";

// Faster than repeated calculations
function addDaysOptimized(date: Date, days: number): Date {
  return new Date(date.getTime() + days * millisecondsInDay);
}

// Pre-calculated constants for common operations
const MILLISECONDS_IN_HOUR = millisecondsInHour;
const MILLISECONDS_IN_WEEK = millisecondsInWeek;

function addHoursOptimized(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * MILLISECONDS_IN_HOUR);
}
```

### Boundary Checking

```typescript
import { maxTime, minTime } from "date-fns/constants";

function safeCreateDate(timestamp: number): Date | null {
  if (timestamp < minTime || timestamp > maxTime) {
    return null; // Invalid timestamp
  }
  return new Date(timestamp);
}

function isDateInValidRange(date: Date): boolean {
  const time = date.getTime();
  return !isNaN(time) && time >= minTime && time <= maxTime;
}
```

## Type Definitions

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

### Utility Types

```typescript { .api }
interface ConstructableDate extends Date {
  [constructFromSymbol]: <DateType extends Date = Date>(
    value: DateArg<Date> & {}
  ) => DateType;
}

type DurationUnit = keyof Duration;

type IntervalUnit = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

type LocaleUnit = 'second' | 'minute' | 'hour' | 'day' | 'date' | 'month' | 'year';

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
type Quarter = 1 | 2 | 3 | 4;
type Era = 0 | 1; // 0 = AD, 1 = BC

type FirstWeekContainsDate = 1 | 4;

type ISOStringFormat = "extended" | "basic";
type ISOStringRepresentation = "complete" | "date" | "time";

type RoundingMethod = "ceil" | "floor" | "round" | "trunc";

type NearestHours = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type NearestMinutes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;

type ContextFn<DateType extends Date> = (value: DateArg<Date> & {}) => DateType;
```

## Common Utility Patterns

### Safe Date Operations

```typescript
import { isValid, toDate, maxTime, minTime } from "date-fns";

function safeDateOperation<T>(
  date: any,
  operation: (validDate: Date) => T,
  fallback: T
): T {
  try {
    const converted = toDate(date);
    if (!isValid(converted)) {
      return fallback;
    }
    
    const timestamp = converted.getTime();
    if (timestamp < minTime || timestamp > maxTime) {
      return fallback;
    }
    
    return operation(converted);
  } catch {
    return fallback;
  }
}
```

### Date Range Validation

```typescript
import { isValid, constructFrom } from "date-fns";

function createValidDateRange(start: any, end: any): Interval | null {
  try {
    const startDate = constructFrom(new Date(), start);
    const endDate = constructFrom(new Date(), end);
    
    if (!isValid(startDate) || !isValid(endDate)) {
      return null;
    }
    
    if (startDate > endDate) {
      return { start: endDate, end: startDate }; // Swap if needed
    }
    
    return { start: startDate, end: endDate };
  } catch {
    return null;
  }
}
```

### Performance Timing

```typescript
import { millisecondsInSecond } from "date-fns/constants";

function measurePerformance<T>(operation: () => T): { result: T; durationMs: number } {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  
  return {
    result,
    durationMs: end - start
  };
}

function formatDuration(ms: number): string {
  if (ms < millisecondsInSecond) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / millisecondsInSecond).toFixed(2)}s`;
  }
}
```