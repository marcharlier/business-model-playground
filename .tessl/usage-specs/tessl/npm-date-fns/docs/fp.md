# Functional Programming

The date-fns functional programming (FP) module provides curried versions of all date functions, enabling functional composition and pipeline-style operations. All FP functions automatically reorder parameters for optimal currying and include full TypeScript support.

## FP Module Overview

### Import Structure

```typescript
// Import individual curried functions
import { add, format, isAfter } from "date-fns/fp";

// Import with namespace
import * as fp from "date-fns/fp";
```

### Currying Pattern

All FP functions follow a consistent currying pattern where the data (typically the date) comes last, enabling partial application and composition:

```typescript
// Regular date-fns: data first
format(date, 'yyyy-MM-dd')

// FP version: data last  
format('yyyy-MM-dd')(date)
```

## Core FP Functions

### Arithmetic Functions

```typescript { .api }
const add: CurriedFn2<Duration, DateArg<Date>, Date>;
const addDays: CurriedFn2<number, DateArg<Date>, Date>;
const addHours: CurriedFn2<number, DateArg<Date>, Date>;
const addMinutes: CurriedFn2<number, DateArg<Date>, Date>;
const addMonths: CurriedFn2<number, DateArg<Date>, Date>;
const addYears: CurriedFn2<number, DateArg<Date>, Date>;
const sub: CurriedFn2<Duration, DateArg<Date>, Date>;
const subDays: CurriedFn2<number, DateArg<Date>, Date>;
const subHours: CurriedFn2<number, DateArg<Date>, Date>;
const subMinutes: CurriedFn2<number, DateArg<Date>, Date>;
const subMonths: CurriedFn2<number, DateArg<Date>, Date>;
const subYears: CurriedFn2<number, DateArg<Date>, Date>;
```

**Examples:**
```typescript
import { add, addDays, subMonths } from "date-fns/fp";

// Create reusable functions
const addOneWeek = add({ weeks: 1 });
const addFiveDays = addDays(5);
const subtractTwoMonths = subMonths(2);

// Apply to dates
const dates = [
  new Date(2014, 0, 1),
  new Date(2014, 0, 15),
  new Date(2014, 0, 30)
];

const datesPlus5 = dates.map(addFiveDays);
const weekFromNow = addOneWeek(new Date());
```

### Formatting Functions

```typescript { .api }
const format: CurriedFn2<string, DateArg<Date>, string>;
const formatDistance: CurriedFn2<DateArg<Date>, DateArg<Date>, string>;
const formatDistanceToNow: CurriedFn1<DateArg<Date>, string>;
const formatISO: CurriedFn1<DateArg<Date>, string>;
const formatRelative: CurriedFn2<DateArg<Date>, DateArg<Date>, string>;
const lightFormat: CurriedFn2<string, DateArg<Date>, string>;
```

**Examples:**
```typescript
import { format, formatDistance, formatISO } from "date-fns/fp";

// Create format functions
const formatYMD = format('yyyy-MM-dd');
const formatLong = format('EEEE, MMMM do, yyyy');
const toISO = formatISO;

// Use in pipelines
const dates = [new Date(2014, 0, 1), new Date(2014, 5, 15)];
const formatted = dates.map(formatYMD);
//=> ['2014-01-01', '2014-06-15']

// Distance from specific date
const distanceFromNewYear = formatDistance(new Date(2014, 0, 1));
distanceFromNewYear(new Date(2014, 5, 15));
//=> '5 months'
```

### Comparison Functions

```typescript { .api }
const compareAsc: CurriedFn2<DateArg<Date>, DateArg<Date>, number>;
const compareDesc: CurriedFn2<DateArg<Date>, DateArg<Date>, number>;
const isAfter: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isBefore: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isEqual: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const max: CurriedFn1<DateArg<Date>[], Date>;
const min: CurriedFn1<DateArg<Date>[], Date>;
```

**Examples:**
```typescript
import { isAfter, isBefore, compareAsc } from "date-fns/fp";

// Create comparison functions
const isAfter2020 = isAfter(new Date(2020, 0, 1));
const isBefore2025 = isBefore(new Date(2025, 0, 1));

// Filter dates
const dates = [
  new Date(2019, 0, 1),
  new Date(2021, 0, 1), 
  new Date(2026, 0, 1)
];

const recentDates = dates.filter(isAfter2020).filter(isBefore2025);
//=> [new Date(2021, 0, 1)]

// Sort dates
const sortedDates = dates.sort(compareAsc);
```

### Validation Functions

```typescript { .api }
const isValid: CurriedFn1<any, boolean>;
const isDate: CurriedFn1<any, boolean>;
const isFuture: CurriedFn1<DateArg<Date>, boolean>;
const isPast: CurriedFn1<DateArg<Date>, boolean>;
const isToday: CurriedFn1<DateArg<Date>, boolean>;
const isWeekend: CurriedFn1<DateArg<Date>, boolean>;
const isMonday: CurriedFn1<DateArg<Date>, boolean>;
const isTuesday: CurriedFn1<DateArg<Date>, boolean>;
const isWednesday: CurriedFn1<DateArg<Date>, boolean>;
const isThursday: CurriedFn1<DateArg<Date>, boolean>;
const isFriday: CurriedFn1<DateArg<Date>, boolean>;
const isSaturday: CurriedFn1<DateArg<Date>, boolean>;
const isSunday: CurriedFn1<DateArg<Date>, boolean>;
```

**Examples:**
```typescript
import { isValid, isWeekend, isFuture } from "date-fns/fp";

// Filter valid dates
const mixedInput = [
  new Date(2014, 0, 1),
  'invalid-date',
  new Date(2014, 0, 2),
  null
];

const validDates = mixedInput.filter(isValid);
//=> [new Date(2014, 0, 1), new Date(2014, 0, 2)]

// Chain validations
const dates = [/* array of dates */];
const futureWeekends = dates.filter(isFuture).filter(isWeekend);
```

### Same Period Functions

```typescript { .api }
const isSameDay: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isSameWeek: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isSameMonth: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isSameYear: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isSameHour: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isSameMinute: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
const isSameSecond: CurriedFn2<DateArg<Date>, DateArg<Date>, boolean>;
```

**Examples:**
```typescript
import { isSameDay, isSameMonth } from "date-fns/fp";

// Find dates matching a reference
const referenceDate = new Date(2014, 0, 15);
const dates = [/* array of dates */];

const sameDayDates = dates.filter(isSameDay(referenceDate));
const sameMonthDates = dates.filter(isSameMonth(referenceDate));
```

## Functional Composition

### Function Composition with Ramda

```typescript
import { pipe, compose } from "ramda";
import { format, addDays, startOfDay } from "date-fns/fp";

// Create a pipeline
const formatTomorrowStart = pipe(
  addDays(1),
  startOfDay,
  format('yyyy-MM-dd HH:mm:ss')
);

formatTomorrowStart(new Date(2014, 0, 1, 14, 30));
//=> '2014-01-02 00:00:00'

// Compose operations (right to left)
const formatNextWeekEnd = compose(
  format('PP'),
  endOfDay,
  addDays(7)
);
```

### Custom Composition Helpers

```typescript
import { addDays, format, startOfWeek, endOfWeek } from "date-fns/fp";

// Create utility functions
const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T) => 
  fns.reduce((acc, fn) => fn(acc), value);

const formatWeekRange = (date: Date) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const formatDate = format('MMM dd');
  return `${formatDate(start)} - ${formatDate(end)}`;
};

// Pipeline for date processing
const processDate = pipe(
  startOfDay,
  addDays(1),
  format('yyyy-MM-dd')
);
```

## Advanced FP Patterns

### Partial Application

```typescript
import { formatDistance, isWithinInterval } from "date-fns/fp";

// Create partially applied functions
const distanceFromToday = formatDistance(new Date());
const isInCurrentYear = isWithinInterval({
  start: startOfYear(new Date()),
  end: endOfYear(new Date())
});

// Use with arrays
const dates = [/* dates */];
const distances = dates.map(distanceFromToday);
const currentYearDates = dates.filter(isInCurrentYear);
```

### Function Factories

```typescript
import { add, format, isBefore } from "date-fns/fp";

// Factory for creating date ranges
const createDateRange = (duration: Duration) => (start: Date): Date[] => {
  const end = add(duration)(start);
  return eachDayOfInterval({ start, end });
};

// Factory for deadline checkers
const createDeadlineChecker = (deadline: Date) => (date: Date): {
  passed: boolean;
  remaining: string;
} => ({
  passed: isAfter(deadline)(date),
  remaining: formatDistance(deadline)(date)
});

// Usage
const getWeekRange = createDateRange({ weeks: 1 });
const checkProjectDeadline = createDeadlineChecker(new Date(2024, 11, 31));

const weekDates = getWeekRange(new Date());
const status = checkProjectDeadline(new Date());
```

### Data Transformation Pipelines

```typescript
import { flow } from "lodash/fp";
import { parse, format, addBusinessDays, isValid } from "date-fns/fp";

// Process CSV date data
const processDateString = flow(
  parse('yyyy-MM-dd', new Date()), // Parse with reference date
  date => isValid(date) ? date : null, // Validate
  date => date ? addBusinessDays(5)(date) : null, // Add business days if valid
  date => date ? format('MM/dd/yyyy')(date) : 'Invalid Date' // Format output
);

const csvDates = ['2014-01-01', '2014-02-15', 'invalid-date'];
const processed = csvDates.map(processDateString);
//=> ['01/08/2014', '02/24/2014', 'Invalid Date']
```

## Option Handling in FP

### Functions with Options

```typescript { .api }
const formatWithOptions: CurriedFn3<FormatOptions, string, DateArg<Date>, string>;
const parseWithOptions: CurriedFn4<ParseOptions, DateArg<Date>, string, string, Date>;
const startOfWeekWithOptions: CurriedFn2<WeekStartOptions, DateArg<Date>, Date>;
```

**Examples:**
```typescript
import { formatWithOptions, startOfWeekWithOptions } from "date-fns/fp";
import { de } from "date-fns/locale";

// Create localized formatters
const formatGerman = formatWithOptions({ locale: de });
const formatGermanDate = formatGerman('EEEE, do MMMM yyyy');

formatGermanDate(new Date(2014, 0, 1));
//=> 'Mittwoch, 1. Januar 2014'

// Week starting on Monday
const startOfWeekMonday = startOfWeekWithOptions({ weekStartsOn: 1 });
const dates = [/* dates */];
const weekStarts = dates.map(startOfWeekMonday);
```

## Performance Considerations

### Memoization

```typescript
import memoize from "lodash/memoize";
import { format, formatDistance } from "date-fns/fp";

// Memoize expensive operations
const memoizedFormat = memoize(format);
const formatISO = memoizedFormat('yyyy-MM-dd');

// Memoize with custom key
const memoizedDistance = memoize(
  formatDistance,
  (referenceDate) => referenceDate.getTime()
);

const distanceFromEpoch = memoizedDistance(new Date(0));
```

### Lazy Evaluation

```typescript
import { addDays, format, isFuture } from "date-fns/fp";

// Create lazy sequences
function* dateSequence(start: Date, step: number = 1) {
  let current = start;
  while (true) {
    yield current;
    current = addDays(step)(current);
  }
}

// Use with functional operations
const futureDates = Array.from(dateSequence(new Date()))
  .slice(0, 100) // Take first 100
  .filter(isFuture)
  .map(format('yyyy-MM-dd'))
  .slice(0, 10); // Take first 10 future dates
```

## Type Definitions

### Curried Function Types

```typescript { .api }
interface CurriedFn1<A, R> {
  (a: A): R;
}

interface CurriedFn2<A, B, R> {
  (a: A): CurriedFn1<B, R>;
  (a: A, b: B): R;
}

interface CurriedFn3<A, B, C, R> {
  (a: A): CurriedFn2<B, C, R>;
  (a: A, b: B): CurriedFn1<C, R>;
  (a: A, b: B, c: C): R;
}

interface CurriedFn4<A, B, C, D, R> {
  (a: A): CurriedFn3<B, C, D, R>;
  (a: A, b: B): CurriedFn2<C, D, R>;
  (a: A, b: B, c: C): CurriedFn1<D, R>;
  (a: A, b: B, c: C, d: D): R;
}
```

## Integration Examples

### React Hooks

```typescript
import { useMemo } from "react";
import { format, addDays, isToday } from "date-fns/fp";

function useDateFormatter(pattern: string) {
  return useMemo(() => format(pattern), [pattern]);
}

function useRelativeDates(dates: Date[]) {
  return useMemo(() => ({
    today: dates.filter(isToday),
    tomorrow: dates.filter(date => isSameDay(addDays(1)(new Date()))(date)),
    formatted: dates.map(format('MMM dd, yyyy'))
  }), [dates]);
}
```

### Redux Selectors

```typescript
import { createSelector } from "reselect";
import { isAfter, format, isSameMonth } from "date-fns/fp";

const getEvents = (state: State) => state.events;
const getCurrentMonth = () => new Date();

const getUpcomingEvents = createSelector(
  getEvents,
  events => events
    .filter(event => isAfter(new Date())(event.date))
    .sort(compareAsc)
);

const getCurrentMonthEvents = createSelector(
  getEvents,
  getCurrentMonth,
  (events, currentMonth) => events.filter(
    event => isSameMonth(currentMonth)(event.date)
  )
);
```

### Validation Schemas

```typescript
import { z } from "zod";
import { isValid, isAfter, isBefore } from "date-fns/fp";

const dateSchema = z.string()
  .transform(str => new Date(str))
  .refine(isValid, "Invalid date")
  .refine(isAfter(new Date(1900, 0, 1)), "Date must be after 1900")
  .refine(isBefore(new Date(2100, 0, 1)), "Date must be before 2100");

const eventSchema = z.object({
  title: z.string(),
  startDate: dateSchema,
  endDate: dateSchema
}).refine(
  data => isBefore(data.endDate)(data.startDate),
  "End date must be after start date"
);
```