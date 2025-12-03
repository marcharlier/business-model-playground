# Internationalization

Error message localization with 44+ languages support.

## Locale Functions

```typescript { .api }
namespace locales {
  function en(): LocaleConfig;     // English (default)
  function es(): LocaleConfig;     // Spanish
  function fr(): LocaleConfig;     // French
  function de(): LocaleConfig;     // German
  function ja(): LocaleConfig;     // Japanese
  function zh_CN(): LocaleConfig;  // Chinese (Simplified)
  function zh_TW(): LocaleConfig;  // Chinese (Traditional)
  function pt(): LocaleConfig;     // Portuguese
  function ru(): LocaleConfig;     // Russian
  function it(): LocaleConfig;     // Italian
  function ko(): LocaleConfig;     // Korean
  function ar(): LocaleConfig;     // Arabic
  function hi(): LocaleConfig;     // Hindi
  function nl(): LocaleConfig;     // Dutch
  function pl(): LocaleConfig;     // Polish
  function tr(): LocaleConfig;     // Turkish
  function sv(): LocaleConfig;     // Swedish
  function cs(): LocaleConfig;     // Czech
  function da(): LocaleConfig;     // Danish
  function fi(): LocaleConfig;     // Finnish
  function he(): LocaleConfig;     // Hebrew
  function hu(): LocaleConfig;     // Hungarian
  function id(): LocaleConfig;     // Indonesian
  function nb(): LocaleConfig;     // Norwegian
  function ro(): LocaleConfig;     // Romanian
  function sk(): LocaleConfig;     // Slovak
  function th(): LocaleConfig;     // Thai
  function uk(): LocaleConfig;     // Ukrainian
  function vi(): LocaleConfig;     // Vietnamese
  // ... and more
}
```

## Global Locale Configuration

```typescript
// Set global locale
z.config({ locale: z.locales.es() });

// All validation errors will use Spanish messages
const schema = z.string().min(5);
schema.safeParse("abc");
// Error message in Spanish: "La cadena debe contener al menos 5 caracteres"
```

## Per-Schema Locale

```typescript
// Per-schema locale via error map
const schema = z.string().min(5);

schema.parse("abc", {
  errorMap: z.locales.fr(),
});
// Error message in French
```

## Available Locales

Full list includes:
- ar (Arabic)
- bg (Bulgarian)
- cs (Czech)
- da (Danish)
- de (German)
- el (Greek)
- en (English)
- es (Spanish)
- fa (Persian)
- fi (Finnish)
- fr (French)
- he (Hebrew)
- hi (Hindi)
- hu (Hungarian)
- id (Indonesian)
- it (Italian)
- ja (Japanese)
- ko (Korean)
- nb (Norwegian)
- nl (Dutch)
- pl (Polish)
- pt (Portuguese)
- ro (Romanian)
- ru (Russian)
- sk (Slovak)
- sv (Swedish)
- th (Thai)
- tr (Turkish)
- uk (Ukrainian)
- vi (Vietnamese)
- zh_CN (Chinese Simplified)
- zh_TW (Chinese Traditional)

## Examples

```typescript
// Spanish
z.config({ locale: z.locales.es() });

const UserSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  age: z.number().positive(),
});

UserSchema.safeParse({ name: "Ab", email: "invalid", age: -5 });
// Errors in Spanish

// French
z.config({ locale: z.locales.fr() });
const result = z.string().email().safeParse("invalid");
// Error: "L'email n'est pas valide"

// Japanese
z.config({ locale: z.locales.ja() });
const result = z.number().min(10).safeParse(5);
// Error: "数値は10以上である必要があります"

// Arabic (RTL language)
z.config({ locale: z.locales.ar() });
const result = z.string().min(5).safeParse("abc");
// Error in Arabic

// Multi-language support
const languages = {
  en: z.locales.en(),
  es: z.locales.es(),
  fr: z.locales.fr(),
  de: z.locales.de(),
};

function validateWithLocale(data: unknown, locale: keyof typeof languages) {
  const errorMap = languages[locale];
  return schema.safeParse(data, { errorMap });
}
```

## Custom Error Messages with Locales

```typescript
// Override specific messages while keeping locale for others
z.config({ locale: z.locales.es() });

const schema = z.string()
  .min(5, "Este mensaje es personalizado")  // Custom message
  .email();  // Will use Spanish locale message

// Per-field custom messages
const FormSchema = z.object({
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.email("Correo electrónico no válido"),
  age: z.number().positive("La edad debe ser positiva"),
});
```

## Common Patterns

```typescript
// Dynamic locale based on user preference
function createValidator(userLocale: string) {
  const localeMap: Record<string, any> = {
    'en': z.locales.en(),
    'es': z.locales.es(),
    'fr': z.locales.fr(),
    'de': z.locales.de(),
    'ja': z.locales.ja(),
  };

  z.config({ locale: localeMap[userLocale] || z.locales.en() });

  return schema;
}

// API with localized errors
async function handleRequest(req: Request) {
  const userLocale = req.headers.get('Accept-Language')?.split(',')[0] || 'en';
  const locale = getLocale(userLocale);

  const result = schema.safeParse(req.body, { errorMap: locale });

  if (!result.success) {
    return Response.json({
      errors: result.error.format(),
    }, { status: 400 });
  }

  return Response.json({ data: result.data });
}

// Form validation with user's language
function validateForm(formData: FormData, language: string) {
  const locales: Record<string, any> = {
    en: z.locales.en(),
    es: z.locales.es(),
    fr: z.locales.fr(),
  };

  const result = FormSchema.safeParse(
    Object.fromEntries(formData.entries()),
    { errorMap: locales[language] || locales.en }
  );

  return result;
}
```

## Fallback Behavior

```typescript
// If locale is not set, English is used by default
const result = z.string().min(5).safeParse("abc");
// Error: "String must contain at least 5 character(s)"

// If invalid locale, falls back to default
z.config({ locale: undefined });
// Uses English (default)
```
