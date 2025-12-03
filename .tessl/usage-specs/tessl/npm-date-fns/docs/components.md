# Date Components

Date component functions provide utilities for getting and setting individual date parts (year, month, day, hour, etc.) with proper handling of time zones and edge cases. All functions are pure and return new date instances.

## Get Functions

### Year Components

```typescript { .api }
function getYear(date: DateArg<Date>): number;
function getISOWeekYear(date: DateArg<Date>): number;
function getWeekYear(date: DateArg<Date>, options?: WeekYearOptions): number;
function getDecade(date: DateArg<Date>): number;
```

**Examples:**
```typescript
import { getYear, getISOWeekYear, getDecade } from "date-fns";

const date = new Date(2014, 1, 11);

getYear(date); //=> 2014
getISOWeekYear(date); //=> 2014
getDecade(date); //=> 2014

// Edge case: ISO week year can differ from calendar year
getYear(new Date(2005, 0, 1)); //=> 2005
getISOWeekYear(new Date(2005, 0, 1)); //=> 2004 (belongs to 2004's ISO week year)
```

### Month and Quarter Components

```typescript { .api }
function getMonth(date: DateArg<Date>): number;
function getQuarter(date: DateArg<Date>): number;
function getDaysInMonth(date: DateArg<Date>): number;
function getDaysInYear(date: DateArg<Date>): number;
```

**Examples:**
```typescript
import { getMonth, getQuarter, getDaysInMonth, getDaysInYear } from "date-fns";

const date = new Date(2014, 1, 11); // February 11, 2014

getMonth(date); //=> 1 (February, 0-indexed)
getQuarter(date); //=> 1 (Q1: Jan-Mar)
getDaysInMonth(date); //=> 28 (February 2014)
getDaysInYear(date); //=> 365 (2014 is not a leap year)

// Leap year
getDaysInYear(new Date(2012, 0, 1)); //=> 366
```

### Day Components

```typescript { .api }
function getDate(date: DateArg<Date>): number;
function getDay(date: DateArg<Date>): number;
function getISODay(date: DateArg<Date>): number;
function getDayOfYear(date: DateArg<Date>): number;
```

**Examples:**
```typescript
import { getDate, getDay, getISODay, getDayOfYear } from "date-fns";

const date = new Date(2014, 1, 11); // Tuesday, February 11, 2014

getDate(date); //=> 11 (day of month)
getDay(date); //=> 2 (Tuesday, 0=Sunday)
getISODay(date); //=> 2 (Tuesday, 1=Monday in ISO)
getDayOfYear(date); //=> 42 (42nd day of 2014)
```

### Week Components

```typescript { .api }
function getWeek(date: DateArg<Date>, options?: WeekOptions): number;
function getISOWeek(date: DateArg<Date>): number;
function getWeekOfMonth(date: DateArg<Date>, options?: WeekOptions): number;
function getWeeksInMonth(date: DateArg<Date>, options?: WeekOptions): number;
function getISOWeeksInYear(date: DateArg<Date>): number;
```

**Examples:**
```typescript
import { getWeek, getISOWeek, getWeekOfMonth } from "date-fns";

const date = new Date(2014, 1, 11);

getWeek(date); //=> 7 (7th week of 2014)
getISOWeek(date); //=> 7 (ISO week 7)
getWeekOfMonth(date); //=> 2 (2nd week of February)
```

### Time Components

```typescript { .api }
function getHours(date: DateArg<Date>): number;
function getMinutes(date: DateArg<Date>): number;
function getSeconds(date: DateArg<Date>): number;
function getMilliseconds(date: DateArg<Date>): number;
function getTime(date: DateArg<Date>): number;
function getUnixTime(date: DateArg<Date>): number;
```

**Examples:**
```typescript
import { getHours, getMinutes, getSeconds, getTime, getUnixTime } from "date-fns";

const date = new Date(2014, 1, 11, 14, 30, 45, 500);

getHours(date); //=> 14
getMinutes(date); //=> 30
getSeconds(date); //=> 45
getMilliseconds(date); //=> 500
getTime(date); //=> 1392123045500 (milliseconds since epoch)
getUnixTime(date); //=> 1392123045 (seconds since epoch)
```

## Set Functions

### Year Setting

```typescript { .api }
function setYear<DateType extends Date>(
  date: DateArg<DateType>,
  year: number
): DateType;
function setISOWeekYear<DateType extends Date>(
  date: DateArg<DateType>,
  isoWeekYear: number
): DateType;
function setWeekYear<DateType extends Date>(
  date: DateArg<DateType>,
  weekYear: number,
  options?: WeekYearOptions
): DateType;
```

**Examples:**
```typescript
import { setYear, setISOWeekYear } from "date-fns";

const date = new Date(2014, 1, 11);

setYear(date, 2020);
//=> Tue Feb 11 2020

// Handle leap year edge case
setYear(new Date(2016, 1, 29), 2017); // Feb 29, 2016
//=> Tue Feb 28 2017 (2017 is not a leap year)
```

### Month and Quarter Setting

```typescript { .api }
function setMonth<DateType extends Date>(
  date: DateArg<DateType>,
  month: number
): DateType;
function setQuarter<DateType extends Date>(
  date: DateArg<DateType>,
  quarter: number
): DateType;
```

**Examples:**
```typescript
import { setMonth, setQuarter } from "date-fns";

const date = new Date(2014, 1, 11);

setMonth(date, 5); // Set to June (0-indexed)
//=> Wed Jun 11 2014

setQuarter(date, 3); // Set to Q3 (July)
//=> Fri Jul 11 2014

// Handle month overflow
setMonth(new Date(2014, 0, 31), 1); // Jan 31 to February
//=> Fri Feb 28 2014 (February doesn't have 31 days)
```

### Day Setting

```typescript { .api }
function setDate<DateType extends Date>(
  date: DateArg<DateType>,
  dayOfMonth: number
): DateType;
function setDay<DateType extends Date>(
  date: DateArg<DateType>,
  day: number,
  options?: WeekOptions
): DateType;
function setISODay<DateType extends Date>(
  date: DateArg<DateType>,
  day: number
): DateType;
function setDayOfYear<DateType extends Date>(
  date: DateArg<DateType>,
  dayOfYear: number
): DateType;
```

**Examples:**
```typescript
import { setDate, setDay, setISODay, setDayOfYear } from "date-fns";

const date = new Date(2014, 1, 11); // Tuesday

setDate(date, 20);
//=> Thu Feb 20 2014

setDay(date, 0); // Set to Sunday
//=> Sun Feb 09 2014

setISODay(date, 1); // Set to Monday (ISO: 1=Monday)
//=> Mon Feb 10 2014

setDayOfYear(date, 100); // 100th day of year
//=> Thu Apr 10 2014
```

### Week Setting

```typescript { .api }
function setWeek<DateType extends Date>(
  date: DateArg<DateType>,
  week: number,
  options?: WeekOptions
): DateType;
function setISOWeek<DateType extends Date>(
  date: DateArg<DateType>,
  isoWeek: number
): DateType;
```

**Examples:**
```typescript
import { setWeek, setISOWeek } from "date-fns";

const date = new Date(2014, 1, 11);

setWeek(date, 1); // First week of year
//=> Mon Jan 06 2014

setISOWeek(date, 1); // ISO week 1
//=> Mon Jan 06 2014
```

### Time Setting

```typescript { .api }
function setHours<DateType extends Date>(
  date: DateArg<DateType>,
  hours: number
): DateType;
function setMinutes<DateType extends Date>(
  date: DateArg<DateType>,
  minutes: number
): DateType;
function setSeconds<DateType extends Date>(
  date: DateArg<DateType>,
  seconds: number
): DateType;
function setMilliseconds<DateType extends Date>(
  date: DateArg<DateType>,
  milliseconds: number
): DateType;
```

**Examples:**
```typescript
import { setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";

const date = new Date(2014, 1, 11, 10, 30, 40, 500);

setHours(date, 14);
//=> Tue Feb 11 2014 14:30:40.500

setMinutes(date, 45);
//=> Tue Feb 11 2014 10:45:40.500

setSeconds(date, 0);
//=> Tue Feb 11 2014 10:30:00.500

setMilliseconds(date, 0);
//=> Tue Feb 11 2014 10:30:40.000
```

## Bulk Setting

### set

Set multiple date components at once.

```typescript { .api }
function set<DateType extends Date>(
  date: DateArg<DateType>,
  values: {
    year?: number;
    month?: number;
    date?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  }
): DateType;
```

**Examples:**
```typescript
import { set } from "date-fns";

const date = new Date(2014, 1, 11, 10, 30, 40, 500);

// Set multiple components
set(date, {
  year: 2020,
  month: 5, // June (0-indexed)
  date: 15,
  hours: 14,
  minutes: 0,
  seconds: 0,
  milliseconds: 0
});
//=> Mon Jun 15 2020 14:00:00.000

// Partial setting
set(date, {
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0
});
//=> Tue Feb 11 2014 00:00:00.000 (only time components changed)
```

## Configuration

### Default Options

```typescript { .api }
function getDefaultOptions(): DefaultOptions;
function setDefaultOptions(newOptions: DefaultOptions): void;
```

**Examples:**
```typescript
import { getDefaultOptions, setDefaultOptions } from "date-fns";
import { enGB } from "date-fns/locale";

// Get current defaults
const currentOptions = getDefaultOptions();

// Set new defaults
setDefaultOptions({
  locale: enGB,
  weekStartsOn: 1, // Monday
  firstWeekContainsDate: 4
});

// Now all functions will use these defaults unless overridden
```

## Advanced Component Access

### Overlapping Intervals

```typescript { .api }
function getOverlappingDaysInIntervals(
  intervalLeft: Interval,
  intervalRight: Interval
): number;
```

**Example:**
```typescript
import { getOverlappingDaysInIntervals } from "date-fns";

const leftInterval = {
  start: new Date(2014, 0, 10),
  end: new Date(2014, 0, 20)
};

const rightInterval = {
  start: new Date(2014, 0, 17),
  end: new Date(2014, 0, 21)
};

getOverlappingDaysInIntervals(leftInterval, rightInterval);
//=> 4 (days 17, 18, 19, 20)
```

## Component Manipulation Patterns

### Date Normalization

```typescript
import { set } from "date-fns";

// Normalize to start of day
function normalizeToStartOfDay(date: Date): Date {
  return set(date, {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });
}

// Normalize to end of day
function normalizeToEndOfDay(date: Date): Date {
  return set(date, {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999
  });
}
```

### Safe Component Setting

```typescript
import { setMonth, getDaysInMonth, setDate } from "date-fns";

// Safely set month, handling day overflow
function safeSetMonth(date: Date, month: number): Date {
  const tempDate = setMonth(date, month);
  const daysInNewMonth = getDaysInMonth(tempDate);
  const currentDay = getDate(date);
  
  if (currentDay > daysInNewMonth) {
    return setDate(tempDate, daysInNewMonth);
  }
  
  return tempDate;
}
```

### Component Validation

```typescript
import { isValid, set, getYear, getMonth, getDate } from "date-fns";

function isValidDateComponents(year: number, month: number, day: number): boolean {
  try {
    const testDate = set(new Date(), { year, month, date: day });
    return isValid(testDate) && 
           getYear(testDate) === year &&
           getMonth(testDate) === month &&
           getDate(testDate) === day;
  } catch {
    return false;
  }
}
```

## Option Types

### WeekOptions

```typescript { .api }
interface WeekOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
```

### WeekYearOptions

```typescript { .api }
interface WeekYearOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
```

### DefaultOptions

```typescript { .api }
interface DefaultOptions {
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
```

## Edge Cases and Considerations

### Month Overflow

When setting months, date-fns automatically handles overflow:

```typescript
import { setMonth } from "date-fns";

// January 31 → February 28 (not March 3)
setMonth(new Date(2014, 0, 31), 1); //=> Feb 28, 2014
```

### Leap Year Handling

```typescript
import { setYear } from "date-fns";

// February 29 in leap year → February 28 in non-leap year
setYear(new Date(2016, 1, 29), 2017); //=> Feb 28, 2017
```

### Week Year vs Calendar Year

ISO week years can differ from calendar years at year boundaries:

```typescript
import { getYear, getISOWeekYear } from "date-fns";

const date = new Date(2005, 0, 1); // January 1, 2005 (Saturday)
getYear(date); //=> 2005
getISOWeekYear(date); //=> 2004 (belongs to last week of ISO year 2004)
```