# Date Arithmetic

Date arithmetic functions provide core date manipulation capabilities for adding, subtracting, and calculating differences between dates. All functions are pure and return new date instances without modifying the input dates.

## Add Functions

### add

Add a duration to a date.

```typescript { .api }
function add<DateType extends Date>(
  date: DateArg<DateType>,
  duration: Duration
): DateType;
```

**Parameters:**
- `date` - The date to add the duration to
- `duration` - The duration object specifying amounts to add

**Example:**
```typescript
import { add } from "date-fns";

const result = add(new Date(2014, 8, 1), {
  years: 2,
  months: 9,
  weeks: 1,
  days: 7,
  hours: 5,
  minutes: 9,
  seconds: 30,
});
//=> Sun Jun 15 2017 05:09:30
```

### Individual Add Functions

Add specific time units to a date.

```typescript { .api }
function addYears<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addMonths<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addQuarters<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addWeeks<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addDays<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addBusinessDays<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addHours<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addMinutes<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addSeconds<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addMilliseconds<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function addISOWeekYears<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
```

**Parameters:**
- `date` - The date to add to
- `amount` - The amount to add (can be negative for subtraction)

**Examples:**
```typescript
import { addDays, addBusinessDays, addMonths } from "date-fns";

// Add 10 days
addDays(new Date(2014, 8, 1), 10);
//=> Thu Sep 11 2014

// Add 10 business days (skips weekends)
addBusinessDays(new Date(2014, 8, 1), 10);
//=> Mon Sep 15 2014

// Add 2 months
addMonths(new Date(2014, 8, 1), 2);
//=> Wed Nov 01 2014
```

## Subtract Functions

### sub

Subtract a duration from a date.

```typescript { .api }
function sub<DateType extends Date>(
  date: DateArg<DateType>,
  duration: Duration
): DateType;
```

**Parameters:**
- `date` - The date to subtract the duration from
- `duration` - The duration object specifying amounts to subtract

**Example:**
```typescript
import { sub } from "date-fns";

const result = sub(new Date(2014, 8, 1), {
  years: 2,
  months: 9,
  weeks: 1,
  days: 7,
  hours: 5,
  minutes: 9,
  seconds: 30,
});
//=> Tue Sep 04 2012
```

### Individual Subtract Functions

Subtract specific time units from a date.

```typescript { .api }
function subYears<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subMonths<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subQuarters<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subWeeks<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subDays<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subBusinessDays<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subHours<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subMinutes<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subSeconds<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subMilliseconds<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
function subISOWeekYears<DateType extends Date>(date: DateArg<DateType>, amount: number): DateType;
```

## Difference Functions

Calculate the difference between two dates in various units.

```typescript { .api }
function differenceInYears(laterDate: DateArg<Date>, earlierDate: DateArg<Date>, options?: DifferenceInYearsOptions): number;
function differenceInMonths(laterDate: DateArg<Date>, earlierDate: DateArg<Date>, options?: DifferenceInMonthsOptions): number;
function differenceInQuarters(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInWeeks(laterDate: DateArg<Date>, earlierDate: DateArg<Date>, options?: DifferenceInWeeksOptions): number;
function differenceInDays(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInBusinessDays(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInHours(laterDate: DateArg<Date>, earlierDate: DateArg<Date>, options?: DifferenceInHoursOptions): number;
function differenceInMinutes(dateLeft: DateArg<Date>, dateRight: DateArg<Date>, options?: DifferenceInMinutesOptions): number;
function differenceInSeconds(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInMilliseconds(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
```

**Parameters:**
- `laterDate` - The later date (or `dateLeft` for differenceInMinutes)
- `earlierDate` - The earlier date (or `dateRight` for differenceInMinutes)
- `options` - Configuration options for supported functions

**Returns:** The number of units between the dates (positive if laterDate > earlierDate)

**Examples:**
```typescript
import { differenceInDays, differenceInHours, differenceInMonths } from "date-fns";

// Days difference
differenceInDays(new Date(2014, 6, 2), new Date(2014, 0, 1));
//=> 182

// Hours difference
differenceInHours(new Date(2014, 6, 2, 06, 0), new Date(2014, 6, 2, 19, 0));
//=> -13

// Months difference
differenceInMonths(new Date(2014, 6, 2), new Date(2012, 0, 1));
//=> 30
```

## Calendar Difference Functions

Calculate differences based on calendar periods rather than exact time spans.

```typescript { .api }
function differenceInCalendarYears(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInCalendarMonths(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInCalendarQuarters(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInCalendarWeeks(laterDate: DateArg<Date>, earlierDate: DateArg<Date>, options?: DifferenceInCalendarWeeksOptions): number;
function differenceInCalendarDays(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInCalendarISOWeeks(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
function differenceInCalendarISOWeekYears(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
```

**Example:**
```typescript
import { differenceInCalendarMonths, differenceInMonths } from "date-fns";

// Calendar months (counts month boundaries)
differenceInCalendarMonths(new Date(2014, 6, 2), new Date(2014, 0, 31));
//=> 6

// Full months (30+ day periods)
differenceInMonths(new Date(2014, 6, 2), new Date(2014, 0, 31));
//=> 5
```

## ISO Week Functions

ISO week year arithmetic for international week-based calculations.

```typescript { .api }
function differenceInISOWeekYears(laterDate: DateArg<Date>, earlierDate: DateArg<Date>): number;
```

**Example:**
```typescript
import { differenceInISOWeekYears } from "date-fns";

differenceInISOWeekYears(new Date(2014, 6, 2), new Date(2012, 0, 1));
//=> 2
```

## Unit Conversion Functions

Convert between different time units for calculations and display.

```typescript { .api }
// Time unit conversions
function millisecondsToSeconds(milliseconds: number): number;
function millisecondsToMinutes(milliseconds: number): number;
function millisecondsToHours(milliseconds: number): number;
function secondsToMinutes(seconds: number): number;
function secondsToHours(seconds: number): number;
function secondsToMilliseconds(seconds: number): number;
function minutesToSeconds(minutes: number): number;
function minutesToHours(minutes: number): number;
function minutesToMilliseconds(minutes: number): number;
function hoursToMinutes(hours: number): number;
function hoursToSeconds(hours: number): number;
function hoursToMilliseconds(hours: number): number;

// Date unit conversions
function daysToWeeks(days: number): number;
function weeksToDays(weeks: number): number;
function monthsToQuarters(months: number): number;
function monthsToYears(months: number): number;
function quartersToMonths(quarters: number): number;
function quartersToYears(quarters: number): number;
function yearsToDays(years: number): number;
function yearsToMonths(years: number): number;
function yearsToQuarters(years: number): number;
```

**Examples:**
```typescript
import { hoursToMinutes, daysToWeeks, monthsToQuarters } from "date-fns";

hoursToMinutes(2); //=> 120
daysToWeeks(14); //=> 2
monthsToQuarters(9); //=> 3
```

## Utility Functions

### clamp

Clamp a date to fit within an interval.

```typescript { .api }
function clamp<DateType extends Date>(
  date: DateArg<DateType>,
  interval: Interval
): DateType;
```

**Example:**
```typescript
import { clamp } from "date-fns";

clamp(new Date(2014, 0, 1), {
  start: new Date(2014, 0, 5),
  end: new Date(2014, 0, 10)
});
//=> Sun Jan 05 2014 (clamped to start)
```

### intervalToDuration

Convert an interval to a duration object.

```typescript { .api }
function intervalToDuration(interval: Interval): Duration;
```

**Example:**
```typescript
import { intervalToDuration } from "date-fns";

intervalToDuration({
  start: new Date(2014, 0, 1, 0, 0, 0),
  end: new Date(2014, 0, 1, 0, 0, 15)
});
//=> { seconds: 15 }
```

## Rounding Functions

Round dates to the nearest specified time unit.

```typescript { .api }
function roundToNearestHours<DateType extends Date>(
  date: DateArg<DateType>,
  options?: RoundToNearestHoursOptions
): DateType;

function roundToNearestMinutes<DateType extends Date>(
  date: DateArg<DateType>,
  options?: RoundToNearestMinutesOptions
): DateType;
```

**Parameters:**
- `date` - The date to round
- `options` - Rounding configuration

**Examples:**
```typescript
import { roundToNearestHours, roundToNearestMinutes } from "date-fns";

// Round to nearest hour
roundToNearestHours(new Date(2014, 6, 10, 12, 30));
//=> Thu Jul 10 2014 13:00:00

// Round to nearest 15 minutes
roundToNearestMinutes(new Date(2014, 6, 10, 12, 7), { nearestTo: 15 });
//=> Thu Jul 10 2014 12:00:00
```

## Duration Conversion

### milliseconds

Convert a duration to milliseconds.

```typescript { .api }
function milliseconds(duration: Duration): number;
```

**Example:**
```typescript
import { milliseconds } from "date-fns";

milliseconds({ hours: 2, minutes: 30 });
//=> 9000000
```

## Options Interfaces

```typescript { .api }
interface DifferenceInYearsOptions extends ContextOptions<Date> {}

interface DifferenceInMonthsOptions extends ContextOptions<Date> {}

interface DifferenceInHoursOptions extends RoundingOptions, ContextOptions<Date> {}

interface DifferenceInMinutesOptions extends RoundingOptions {}

interface DifferenceInWeeksOptions extends RoundingOptions, ContextOptions<Date> {}

interface DifferenceInCalendarWeeksOptions extends LocalizedOptions<"options">, WeekOptions, ContextOptions<Date> {}

interface RoundToNearestHoursOptions<DateType extends Date = Date> 
  extends NearestToUnitOptions<NearestHours>, RoundingOptions, ContextOptions<DateType> {}

interface RoundToNearestMinutesOptions<DateType extends Date = Date>
  extends NearestToUnitOptions<NearestMinutes>, RoundingOptions, ContextOptions<DateType> {}

interface RoundingOptions {
  roundingMethod?: "ceil" | "floor" | "round" | "trunc";
}

interface NearestToUnitOptions<Unit extends number> {
  nearestTo?: Unit;
}

type NearestHours = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type NearestMinutes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;
```