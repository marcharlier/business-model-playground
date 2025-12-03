# Date Validation and Comparison

Date validation and comparison functions provide comprehensive utilities for checking date validity, temporal relationships, and period-based comparisons. All functions handle edge cases and invalid dates gracefully.

## Core Validation

### isValid

Check if a date is valid.

```typescript { .api }
function isValid(date: unknown): boolean;
```

**Parameters:**
- `date` - Any value to check for date validity

**Examples:**
```typescript
import { isValid } from "date-fns";

// Valid dates
isValid(new Date(2014, 1, 11)); //=> true
isValid(new Date('2014-02-11')); //=> true

// Invalid dates
isValid(new Date('invalid')); //=> false
isValid(new Date(2014, 13, 1)); //=> false (month 13)
isValid(new Date(2014, 1, 30)); //=> false (Feb 30)

// Non-date values
isValid('2014-02-11'); //=> false
isValid(null); //=> false
isValid(undefined); //=> false
```

### isDate

Check if a value is a Date object.

```typescript { .api }
function isDate(value: any): value is Date;
```

**Examples:**
```typescript
import { isDate } from "date-fns";

isDate(new Date()); //=> true
isDate(new Date('invalid')); //=> true (still a Date object)
isDate('2014-02-11'); //=> false
isDate(1392098430000); //=> false
```

### isExists

Check if a date exists in the calendar.

```typescript { .api }
function isExists(year: number, month: number, day: number): boolean;
```

**Parameters:**
- `year` - The year to check
- `month` - The month to check (0-11, January is 0)
- `day` - The day to check (1-31)

**Examples:**
```typescript
import { isExists } from "date-fns";

// Valid dates
isExists(2014, 1, 11); //=> true
isExists(2014, 1, 28); //=> true

// Invalid dates
isExists(2014, 1, 30); //=> false (Feb 30)
isExists(2014, 13, 1); //=> false (month 13)
isExists(2014, 1, 0); //=> false (day 0)
```

### isMatch

Check if a date string matches a format pattern.

```typescript { .api }
function isMatch(dateStr: string, formatStr: string, options?: IsMatchOptions): boolean;
```

**Parameters:**
- `dateStr` - The date string to validate
- `formatStr` - The format pattern to match against
- `options` - Optional matching configuration

**Examples:**
```typescript
import { isMatch } from "date-fns";

// Valid formats
isMatch('2014-02-11', 'yyyy-MM-dd'); //=> true
isMatch('11/02/2014', 'MM/dd/yyyy'); //=> true
isMatch('Feb 11, 2014', 'MMM dd, yyyy'); //=> true

// Invalid formats  
isMatch('2014-02-11', 'dd/MM/yyyy'); //=> false
isMatch('invalid date', 'yyyy-MM-dd'); //=> false
isMatch('2014-13-01', 'yyyy-MM-dd'); //=> false (invalid month)
```

## Date Comparison

### Basic Comparison

```typescript { .api }
function isAfter(date: DateArg<Date>, dateToCompare: DateArg<Date>): boolean;
function isBefore(date: DateArg<Date>, dateToCompare: DateArg<Date>): boolean;
function isEqual(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
```

**Examples:**
```typescript
import { isAfter, isBefore, isEqual } from "date-fns";

const date1 = new Date(2014, 0, 1);
const date2 = new Date(2014, 0, 2);

isAfter(date2, date1); //=> true
isBefore(date1, date2); //=> true
isEqual(date1, date1); //=> true
```

### Comparison Functions

```typescript { .api }
function compareAsc(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): number;
function compareDesc(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): number;
```

**Returns:**
- `-1` if first date is before second date
- `0` if dates are equal
- `1` if first date is after second date

**Examples:**
```typescript
import { compareAsc, compareDesc } from "date-fns";

const date1 = new Date(2014, 0, 1);
const date2 = new Date(2014, 0, 2);

compareAsc(date1, date2); //=> -1
compareAsc(date2, date1); //=> 1
compareAsc(date1, date1); //=> 0

// For sorting
const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10)
];
dates.sort(compareAsc);
// Now sorted chronologically
```

### Min/Max Functions

```typescript { .api }
function min(dates: DateArg<Date>[]): Date;
function max(dates: DateArg<Date>[]): Date;
```

**Examples:**
```typescript
import { min, max } from "date-fns";

const dates = [
  new Date(1989, 6, 10),
  new Date(1987, 1, 11),
  new Date(1995, 6, 2)
];

min(dates); //=> new Date(1987, 1, 11)
max(dates); //=> new Date(1995, 6, 2)
```

## Temporal Validation

### Relative to Current Time

```typescript { .api }
function isFuture(date: DateArg<Date>): boolean;
function isPast(date: DateArg<Date>): boolean;
function isToday(date: DateArg<Date>): boolean;
function isTomorrow(date: DateArg<Date>): boolean;
function isYesterday(date: DateArg<Date>): boolean;
```

**Examples:**
```typescript
import { isFuture, isPast, isToday, isTomorrow, isYesterday } from "date-fns";

const now = new Date();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

isFuture(tomorrow); //=> true
isPast(new Date(2020, 0, 1)); //=> true (assuming current year > 2020)
isToday(now); //=> true
```

### This Period Validation

```typescript { .api }
function isThisSecond(date: DateArg<Date>): boolean;
function isThisMinute(date: DateArg<Date>): boolean;
function isThisHour(date: DateArg<Date>): boolean;
function isThisWeek(date: DateArg<Date>, options?: WeekOptions): boolean;
function isThisISOWeek(date: DateArg<Date>): boolean;
function isThisMonth(date: DateArg<Date>): boolean;
function isThisQuarter(date: DateArg<Date>): boolean;
function isThisYear(date: DateArg<Date>): boolean;
```

**Examples:**
```typescript
import { isThisWeek, isThisMonth, isThisYear } from "date-fns";

const now = new Date();

isThisWeek(now); //=> true
isThisMonth(now); //=> true
isThisYear(now); //=> true

// Last year
isThisYear(new Date(2020, 0, 1)); //=> false (if current year > 2020)
```

## Day of Week Validation

### Specific Day Checks

```typescript { .api }
function isMonday(date: DateArg<Date>): boolean;
function isTuesday(date: DateArg<Date>): boolean;
function isWednesday(date: DateArg<Date>): boolean;
function isThursday(date: DateArg<Date>): boolean;
function isFriday(date: DateArg<Date>): boolean;
function isSaturday(date: DateArg<Date>): boolean;
function isSunday(date: DateArg<Date>): boolean;
function isWeekend(date: DateArg<Date>): boolean;
```

**Examples:**
```typescript
import { isMonday, isSaturday, isWeekend } from "date-fns";

// Monday, Feb 10, 2014
const monday = new Date(2014, 1, 10);
isMonday(monday); //=> true
isSaturday(monday); //=> false

// Saturday, Feb 8, 2014
const saturday = new Date(2014, 1, 8);
isWeekend(saturday); //=> true
```

## Same Period Validation

### Same Time Unit Checks

```typescript { .api }
function isSameSecond(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameMinute(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameHour(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameDay(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameWeek(dateLeft: DateArg<Date>, dateRight: DateArg<Date>, options?: WeekOptions): boolean;
function isSameISOWeek(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameMonth(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameQuarter(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameYear(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
function isSameISOWeekYear(dateLeft: DateArg<Date>, dateRight: DateArg<Date>): boolean;
```

**Examples:**
```typescript
import { isSameDay, isSameWeek, isSameMonth, isSameYear } from "date-fns";

const date1 = new Date(2014, 8, 6, 14, 0);
const date2 = new Date(2014, 8, 6, 15, 30);

isSameDay(date1, date2); //=> true (same day, different time)
isSameWeek(date1, date2); //=> true
isSameMonth(date1, date2); //=> true
isSameYear(date1, date2); //=> true

// Different days
const date3 = new Date(2014, 8, 7);
isSameDay(date1, date3); //=> false
```

## Period Boundary Validation

### Month Boundaries

```typescript { .api }
function isFirstDayOfMonth(date: DateArg<Date>): boolean;
function isLastDayOfMonth(date: DateArg<Date>): boolean;
```

**Examples:**
```typescript
import { isFirstDayOfMonth, isLastDayOfMonth } from "date-fns";

isFirstDayOfMonth(new Date(2014, 1, 1)); //=> true
isFirstDayOfMonth(new Date(2014, 1, 2)); //=> false

isLastDayOfMonth(new Date(2014, 1, 28)); //=> true (Feb in non-leap year)
isLastDayOfMonth(new Date(2014, 1, 27)); //=> false
```

### Leap Year

```typescript { .api }
function isLeapYear(date: DateArg<Date>): boolean;
```

**Examples:**
```typescript
import { isLeapYear } from "date-fns";

isLeapYear(new Date(2012, 0, 1)); //=> true
isLeapYear(new Date(2013, 0, 1)); //=> false
isLeapYear(new Date(2000, 0, 1)); //=> true
isLeapYear(new Date(1900, 0, 1)); //=> false
```

## Interval Validation

### Interval Checks

```typescript { .api }
function isWithinInterval(date: DateArg<Date>, interval: Interval): boolean;
function areIntervalsOverlapping(
  intervalLeft: Interval,
  intervalRight: Interval,
  options?: IntervalOptions
): boolean;
```

**Examples:**
```typescript
import { isWithinInterval, areIntervalsOverlapping } from "date-fns";

// Within interval
isWithinInterval(new Date(2014, 0, 3), {
  start: new Date(2014, 0, 1),
  end: new Date(2014, 0, 7)
}); //=> true

// Overlapping intervals
areIntervalsOverlapping(
  { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
  { start: new Date(2014, 0, 17), end: new Date(2014, 0, 21) }
); //=> true

// Non-overlapping intervals
areIntervalsOverlapping(
  { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
  { start: new Date(2014, 0, 21), end: new Date(2014, 0, 30) }
); //=> false
```

## Utility Functions

### Closest Date Finding

```typescript { .api }
function closestTo(dateToCompare: DateArg<Date>, dates: DateArg<Date>[]): Date;
function closestIndexTo(dateToCompare: DateArg<Date>, dates: DateArg<Date>[]): number;
```

**Examples:**
```typescript
import { closestTo, closestIndexTo } from "date-fns";

const dateToCompare = new Date(2015, 8, 6);
const dates = [
  new Date(2015, 0, 1),
  new Date(2016, 0, 1),
  new Date(2017, 0, 1)
];

closestTo(dateToCompare, dates); //=> new Date(2015, 0, 1)
closestIndexTo(dateToCompare, dates); //=> 0
```

## Option Types

### WeekOptions

```typescript { .api }
interface WeekOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
```

### IsMatchOptions

```typescript { .api }
interface IsMatchOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  useAdditionalWeekYearTokens?: boolean;
  useAdditionalDayOfYearTokens?: boolean;
}
```

### IntervalOptions

```typescript { .api }
interface IntervalOptions {
  inclusive?: boolean;
}
```

## Common Patterns

### Validation Chain

```typescript
import { isValid, isAfter, isBefore } from "date-fns";

function validateDateRange(date: any, minDate: Date, maxDate: Date): boolean {
  return isValid(date) && 
         isAfter(date, minDate) && 
         isBefore(date, maxDate);
}
```

### Array Filtering

```typescript
import { isWeekend, isFuture } from "date-fns";

const dates = [/* array of dates */];

// Filter weekend dates
const weekends = dates.filter(isWeekend);

// Filter future dates
const futureDates = dates.filter(isFuture);
```

### Safe Comparison

```typescript
import { isValid, compareAsc } from "date-fns";

function safeCompareAsc(date1: any, date2: any): number {
  if (!isValid(date1) || !isValid(date2)) {
    throw new Error('Invalid date provided');
  }
  return compareAsc(date1, date2);
}
```