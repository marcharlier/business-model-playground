# Time Periods

Time period utilities provide functions for working with specific time periods like start/end of time units, iteration over date ranges, and navigation to specific dates. All functions handle edge cases and timezone considerations properly.

## Start of Period Functions

### Basic Time Units

```typescript { .api }
function startOfSecond<DateType extends Date>(date: DateArg<DateType>): DateType;
function startOfMinute<DateType extends Date>(date: DateArg<DateType>): DateType;
function startOfHour<DateType extends Date>(date: DateArg<DateType>): DateType;
function startOfDay<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { startOfSecond, startOfMinute, startOfHour, startOfDay } from "date-fns";

const date = new Date(2014, 1, 11, 14, 30, 45, 500);

startOfSecond(date);
//=> Tue Feb 11 2014 14:30:45.000

startOfMinute(date);
//=> Tue Feb 11 2014 14:30:00.000

startOfHour(date);
//=> Tue Feb 11 2014 14:00:00.000

startOfDay(date);
//=> Tue Feb 11 2014 00:00:00.000
```

### Week and Month Periods

```typescript { .api }
function startOfWeek<DateType extends Date>(
  date: DateArg<DateType>,
  options?: WeekStartOptions
): DateType;
function startOfISOWeek<DateType extends Date>(date: DateArg<DateType>): DateType;
function startOfMonth<DateType extends Date>(date: DateArg<DateType>): DateType;
function startOfQuarter<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { startOfWeek, startOfISOWeek, startOfMonth, startOfQuarter } from "date-fns";

const date = new Date(2014, 1, 11); // Tuesday, Feb 11, 2014

startOfWeek(date);
//=> Sun Feb 09 2014 00:00:00 (week starts Sunday by default)

startOfWeek(date, { weekStartsOn: 1 });
//=> Mon Feb 10 2014 00:00:00 (week starts Monday)

startOfISOWeek(date);
//=> Mon Feb 10 2014 00:00:00 (ISO week always starts Monday)

startOfMonth(date);
//=> Sat Feb 01 2014 00:00:00

startOfQuarter(date);
//=> Wed Jan 01 2014 00:00:00 (Q1 starts in January)
```

### Year and Decade Periods

```typescript { .api }
function startOfYear<DateType extends Date>(date: DateArg<DateType>): DateType;
function startOfISOWeekYear<DateType extends Date>(date: DateArg<DateType>): DateType;
function startOfWeekYear<DateType extends Date>(
  date: DateArg<DateType>,
  options?: WeekStartOptions
): DateType;
function startOfDecade<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { startOfYear, startOfISOWeekYear, startOfDecade } from "date-fns";

const date = new Date(2014, 1, 11);

startOfYear(date);
//=> Wed Jan 01 2014 00:00:00

startOfISOWeekYear(date);
//=> Mon Dec 30 2013 00:00:00 (ISO week year 2014 starts in 2013)

startOfDecade(date);
//=> Fri Jan 01 2010 00:00:00 (2010s decade)
```

### Special Date Functions

```typescript { .api }
function startOfToday(): Date;
function startOfTomorrow(): Date;
function startOfYesterday(): Date;
```

**Examples:**
```typescript
import { startOfToday, startOfTomorrow, startOfYesterday } from "date-fns";

// These return dates relative to the current moment
startOfToday();    //=> Today at 00:00:00
startOfTomorrow(); //=> Tomorrow at 00:00:00  
startOfYesterday(); //=> Yesterday at 00:00:00
```

## End of Period Functions

### Basic Time Units

```typescript { .api }
function endOfSecond<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfMinute<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfHour<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfDay<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { endOfSecond, endOfMinute, endOfHour, endOfDay } from "date-fns";

const date = new Date(2014, 1, 11, 14, 30, 45, 500);

endOfSecond(date);
//=> Tue Feb 11 2014 14:30:45.999

endOfMinute(date);
//=> Tue Feb 11 2014 14:30:59.999

endOfHour(date);
//=> Tue Feb 11 2014 14:59:59.999

endOfDay(date);
//=> Tue Feb 11 2014 23:59:59.999
```

### Week and Month Periods

```typescript { .api }
function endOfWeek<DateType extends Date>(
  date: DateArg<DateType>,
  options?: WeekStartOptions
): DateType;
function endOfISOWeek<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfMonth<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfQuarter<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { endOfWeek, endOfISOWeek, endOfMonth, endOfQuarter } from "date-fns";

const date = new Date(2014, 1, 11); // Tuesday, Feb 11, 2014

endOfWeek(date);
//=> Sat Feb 15 2014 23:59:59.999

endOfISOWeek(date);
//=> Sun Feb 16 2014 23:59:59.999

endOfMonth(date);
//=> Fri Feb 28 2014 23:59:59.999

endOfQuarter(date);
//=> Mon Mar 31 2014 23:59:59.999 (Q1 ends in March)
```

### Year and Decade Periods

```typescript { .api }
function endOfYear<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfISOWeekYear<DateType extends Date>(date: DateArg<DateType>): DateType;
function endOfDecade<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { endOfYear, endOfISOWeekYear, endOfDecade } from "date-fns";

const date = new Date(2014, 1, 11);

endOfYear(date);
//=> Wed Dec 31 2014 23:59:59.999

endOfISOWeekYear(date);
//=> Sun Dec 28 2014 23:59:59.999

endOfDecade(date);
//=> Tue Dec 31 2019 23:59:59.999 (2010s decade ends in 2019)
```

### Special Date Functions

```typescript { .api }
function endOfToday(): Date;
function endOfTomorrow(): Date;
function endOfYesterday(): Date;
```

## Last Day Functions

### Period Last Days

```typescript { .api }
function lastDayOfMonth<DateType extends Date>(date: DateArg<DateType>): DateType;
function lastDayOfQuarter<DateType extends Date>(
  date: DateArg<DateType>,
  options?: QuarterOptions
): DateType;
function lastDayOfYear<DateType extends Date>(date: DateArg<DateType>): DateType;
function lastDayOfDecade<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { lastDayOfMonth, lastDayOfQuarter, lastDayOfYear, lastDayOfDecade } from "date-fns";

const date = new Date(2014, 1, 11); // February 11, 2014

lastDayOfMonth(date);
//=> Fri Feb 28 2014 00:00:00

lastDayOfQuarter(date);
//=> Mon Mar 31 2014 00:00:00 (Q1 ends March 31)

lastDayOfYear(date);
//=> Wed Dec 31 2014 00:00:00

lastDayOfDecade(date);
//=> Tue Dec 31 2019 00:00:00
```

### Week Last Days

```typescript { .api }
function lastDayOfWeek<DateType extends Date>(
  date: DateArg<DateType>,
  options?: WeekStartOptions
): DateType;
function lastDayOfISOWeek<DateType extends Date>(date: DateArg<DateType>): DateType;
function lastDayOfISOWeekYear<DateType extends Date>(date: DateArg<DateType>): DateType;
```

**Examples:**
```typescript
import { lastDayOfWeek, lastDayOfISOWeek, lastDayOfISOWeekYear } from "date-fns";

const date = new Date(2014, 1, 11); // Tuesday

lastDayOfWeek(date);
//=> Sat Feb 15 2014 00:00:00 (Saturday ends the week)

lastDayOfWeek(date, { weekStartsOn: 1 });
//=> Sun Feb 16 2014 00:00:00 (Sunday ends Monday-starting week)

lastDayOfISOWeek(date);
//=> Sun Feb 16 2014 00:00:00 (ISO week ends Sunday)

lastDayOfISOWeekYear(date);
//=> Sun Dec 28 2014 00:00:00
```

## Iteration Functions

### Basic Iteration

```typescript { .api }
function eachDayOfInterval(
  interval: Interval,
  options?: StepOptions
): Date[];
function eachHourOfInterval(
  interval: Interval,
  options?: StepOptions
): Date[];
function eachMinuteOfInterval(
  interval: Interval,
  options?: StepOptions
): Date[];
```

**Examples:**
```typescript
import { eachDayOfInterval, eachHourOfInterval } from "date-fns";

// Each day in interval
eachDayOfInterval({
  start: new Date(2014, 0, 1),
  end: new Date(2014, 0, 3)
});
//=> [
//     Wed Jan 01 2014,
//     Thu Jan 02 2014,
//     Fri Jan 03 2014
//   ]

// Every other day
eachDayOfInterval({
  start: new Date(2014, 0, 1),
  end: new Date(2014, 0, 7)
}, { step: 2 });
//=> [Jan 01, Jan 03, Jan 05, Jan 07]

// Each hour
eachHourOfInterval({
  start: new Date(2014, 0, 1, 0),
  end: new Date(2014, 0, 1, 3)
});
//=> [01 00:00, 01 01:00, 01 02:00, 01 03:00]
```

### Period Iteration

```typescript { .api }
function eachWeekOfInterval(
  interval: Interval,
  options?: WeekIterationOptions
): Date[];
function eachMonthOfInterval(
  interval: Interval,
  options?: StepOptions
): Date[];
function eachQuarterOfInterval(
  interval: Interval,
  options?: StepOptions
): Date[];
function eachYearOfInterval(
  interval: Interval,
  options?: StepOptions
): Date[];
```

**Examples:**
```typescript
import { eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval } from "date-fns";

// Each week
eachWeekOfInterval({
  start: new Date(2014, 0, 1),
  end: new Date(2014, 0, 21)
});
//=> [Dec 29 2013, Jan 05 2014, Jan 12 2014, Jan 19 2014]

// Each month
eachMonthOfInterval({
  start: new Date(2014, 0, 1),
  end: new Date(2014, 3, 1)
});
//=> [Jan 01 2014, Feb 01 2014, Mar 01 2014, Apr 01 2014]

// Each year with step
eachYearOfInterval({
  start: new Date(2010, 0, 1),
  end: new Date(2020, 0, 1)
}, { step: 2 });
//=> [2010, 2012, 2014, 2016, 2018, 2020]
```

### Weekend Iteration

```typescript { .api }
function eachWeekendOfInterval(interval: Interval): Date[];
function eachWeekendOfMonth(date: DateArg<Date>): Date[];
function eachWeekendOfYear(date: DateArg<Date>): Date[];
```

**Examples:**
```typescript
import { eachWeekendOfInterval, eachWeekendOfMonth } from "date-fns";

// Weekends in interval
eachWeekendOfInterval({
  start: new Date(2018, 8, 17), // Monday
  end: new Date(2018, 8, 30)   // Sunday
});
//=> [
//     Sat Sep 22 2018,
//     Sun Sep 23 2018,
//     Sat Sep 29 2018,
//     Sun Sep 30 2018
//   ]

// Weekends in month
eachWeekendOfMonth(new Date(2022, 1, 1));
//=> All Saturday and Sunday dates in February 2022
```

## Navigation Functions

### Next Day Navigation

```typescript { .api }
function nextDay(date: DateArg<Date>, day: Day): Date;
function nextMonday(date: DateArg<Date>): Date;
function nextTuesday(date: DateArg<Date>): Date;
function nextWednesday(date: DateArg<Date>): Date;
function nextThursday(date: DateArg<Date>): Date;
function nextFriday(date: DateArg<Date>): Date;
function nextSaturday(date: DateArg<Date>): Date;
function nextSunday(date: DateArg<Date>): Date;
```

**Examples:**
```typescript
import { nextDay, nextMonday, nextFriday } from "date-fns";

const date = new Date(2020, 2, 20); // Friday, March 20, 2020

nextDay(date, 1); // Next Monday
//=> Mon Mar 23 2020

nextMonday(date);
//=> Mon Mar 23 2020

nextFriday(date);
//=> Fri Mar 27 2020 (next Friday, not same day)

// Using Day enum
nextDay(date, 0); // Next Sunday
//=> Sun Mar 22 2020
```

### Previous Day Navigation

```typescript { .api }
function previousDay(date: DateArg<Date>, day: Day): Date;
function previousMonday(date: DateArg<Date>): Date;
function previousTuesday(date: DateArg<Date>): Date;
function previousWednesday(date: DateArg<Date>): Date;
function previousThursday(date: DateArg<Date>): Date;
function previousFriday(date: DateArg<Date>): Date;
function previousSaturday(date: DateArg<Date>): Date;
function previousSunday(date: DateArg<Date>): Date;
```

**Examples:**
```typescript
import { previousDay, previousMonday, previousFriday } from "date-fns";

const date = new Date(2020, 2, 20); // Friday, March 20, 2020

previousDay(date, 1); // Previous Monday
//=> Mon Mar 16 2020

previousMonday(date);
//=> Mon Mar 16 2020

previousFriday(date);
//=> Fri Mar 13 2020 (previous Friday, not same day)
```

## Rounding Functions

### Time Rounding

```typescript { .api }
function roundToNearestMinutes<DateType extends Date>(
  date: DateArg<DateType>,
  options?: RoundToNearestMinutesOptions
): DateType;
function roundToNearestHours<DateType extends Date>(
  date: DateArg<DateType>,
  options?: RoundToNearestHoursOptions
): DateType;
```

**Examples:**
```typescript
import { roundToNearestMinutes, roundToNearestHours } from "date-fns";

const date = new Date(2014, 6, 10, 12, 7, 30);

// Round to nearest 5 minutes
roundToNearestMinutes(date, { nearestTo: 5 });
//=> Thu Jul 10 2014 12:05:00 (rounds down)

// Round to nearest 15 minutes
roundToNearestMinutes(date, { nearestTo: 15 });
//=> Thu Jul 10 2014 12:00:00

// Round to nearest hour (default: 1 hour)
roundToNearestHours(date);
//=> Thu Jul 10 2014 12:00:00

// Round to nearest 4 hours
roundToNearestHours(date, { nearestTo: 4 });
//=> Thu Jul 10 2014 12:00:00
```

## Option Types

### WeekStartOptions

```typescript { .api }
interface WeekStartOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
```

### RoundToNearestMinutesOptions

```typescript { .api }
interface RoundToNearestMinutesOptions<DateType extends Date = Date>
  extends NearestToUnitOptions<NearestMinutes>, RoundingOptions, ContextOptions<DateType> {}
```

### RoundToNearestHoursOptions

```typescript { .api }
interface RoundToNearestHoursOptions<DateType extends Date = Date>
  extends NearestToUnitOptions<NearestHours>, RoundingOptions, ContextOptions<DateType> {}
```

### WeekIterationOptions

```typescript { .api }
interface WeekIterationOptions extends StepOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
```

### QuarterOptions

```typescript { .api }
interface QuarterOptions {
  locale?: Locale;
}
```

### StepOptions

```typescript { .api }
interface StepOptions {
  step?: number;
}
```

### Day Enum

```typescript { .api }
enum Day {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}
```

## Common Patterns

### Working Hours Calculation

```typescript
import { eachDayOfInterval, startOfDay, endOfDay, isWeekend } from "date-fns";

function getWorkingDays(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end })
    .filter(date => !isWeekend(date));
}

function getWorkingHours(date: Date): { start: Date; end: Date } {
  return {
    start: setHours(startOfDay(date), 9), // 9 AM
    end: setHours(startOfDay(date), 17)   // 5 PM
  };
}
```

### Period Boundaries

```typescript
import { startOfMonth, endOfMonth, eachWeekOfInterval } from "date-fns";

function getMonthBoundaries(date: Date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
}

function getWeeksInMonth(date: Date): Date[] {
  const { start, end } = getMonthBoundaries(date);
  return eachWeekOfInterval({ start, end });
}
```

### Flexible Iteration

```typescript
import { eachDayOfInterval } from "date-fns";

function getBusinessDays(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end })
    .filter(date => {
      const day = getDay(date);
      return day !== 0 && day !== 6; // Not Sunday or Saturday
    });
}
```