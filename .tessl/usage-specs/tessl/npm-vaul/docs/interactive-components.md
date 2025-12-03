# Interactive Components

Specialized components for drawer interaction and accessibility. These components provide enhanced functionality for user interaction and ensure proper accessibility support.

## Capabilities

### Drawer.Handle

Draggable handle component that provides a visual and interactive element for users to drag the drawer. The handle enables gesture-based interaction and can prevent snap point cycling.

```typescript { .api }
/**
 * Draggable handle component for drawer interaction
 * @param props - Handle component props
 * @param ref - Forwarded ref to the handle element
 * @returns Handle component for drawer dragging
 */
interface Drawer.Handle extends React.ForwardRefExoticComponent<HandleProps> {}

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Prevent snap point cycling when dragging the handle */
  preventCycle?: boolean;
}
```

**Usage Examples:**

```typescript
// Basic handle
<Drawer.Content>
  <Drawer.Handle />
  <div>Drawer content...</div>
</Drawer.Content>

// Handle with custom styling
<Drawer.Handle className="drawer-handle" />

// Handle that prevents cycling through snap points
<Drawer.Handle preventCycle />

// Handle with custom content
<Drawer.Handle>
  <div className="handle-bar" />
</Drawer.Handle>
```

### Drawer.Close

Element that closes the drawer when activated. Can be applied to any interactive element to give it close functionality.

```typescript { .api }
/**
 * Element that closes the drawer when activated
 */
interface Drawer.Close extends typeof DialogPrimitive.Close {}
```

**Usage Examples:**

```typescript
// Basic close button
<Drawer.Close>Close</Drawer.Close>

// Close button with custom styling
<Drawer.Close className="close-button">×</Drawer.Close>

// Close applied to custom element
<Drawer.Close asChild>
  <button className="my-close-button">
    <Icon name="x" />
  </button>
</Drawer.Close>

// Multiple close triggers
<div>
  <Drawer.Close>Cancel</Drawer.Close>
  <Drawer.Close>Done</Drawer.Close>
</div>
```

### Drawer.Title

Accessible title element for the drawer. This component provides proper semantic markup and screen reader support for the drawer's title.

```typescript { .api }
/**
 * Accessible title element for drawer
 */
interface Drawer.Title extends typeof DialogPrimitive.Title {}
```

**Usage Examples:**

```typescript
// Basic title
<Drawer.Title>Settings</Drawer.Title>

// Title with custom styling
<Drawer.Title className="drawer-title">
  User Profile
</Drawer.Title>

// Title as different heading level
<Drawer.Title asChild>
  <h1>Main Drawer</h1>
</Drawer.Title>
```

### Drawer.Description

Accessible description element for the drawer. This component provides additional context and screen reader support for describing the drawer's purpose or contents.

```typescript { .api }
/**
 * Accessible description element for drawer
 */
interface Drawer.Description extends typeof DialogPrimitive.Description {}
```

**Usage Examples:**

```typescript
// Basic description
<Drawer.Description>
  Configure your account settings and preferences.
</Drawer.Description>

// Description with custom styling
<Drawer.Description className="drawer-description">
  This drawer contains important information about your account.
</Drawer.Description>

// Description as different element
<Drawer.Description asChild>
  <p className="custom-description">
    Complete the form below to continue.
  </p>
</Drawer.Description>
```

### Drawer.NestedRoot

Special root component for nested drawers. This component enables creating drawers within drawers while maintaining proper state management and interaction.

```typescript { .api }
/**
 * Root component for nested drawers
 * @param props - Same as DialogProps but with nested-specific behavior
 * @returns Nested root component
 */
interface Drawer.NestedRoot extends React.Component<DialogProps> {}
```

**Usage Examples:**

```typescript
// Nested drawer structure
<Drawer.Root>
  <Drawer.Trigger>Open Main Drawer</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Content>
      <Drawer.Title>Main Drawer</Drawer.Title>
      
      {/* Nested drawer */}
      <Drawer.NestedRoot>
        <Drawer.Trigger>Open Nested</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Content>
            <Drawer.Title>Nested Drawer</Drawer.Title>
            <p>This is nested content</p>
            <Drawer.Close>Close Nested</Drawer.Close>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.NestedRoot>
      
      <Drawer.Close>Close Main</Drawer.Close>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>

// Multiple nested levels
<Drawer.Root>
  <Drawer.Trigger>Level 1</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Content>
      <Drawer.NestedRoot>
        <Drawer.Trigger>Level 2</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Content>
            <Drawer.NestedRoot>
              <Drawer.Trigger>Level 3</Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Content>
                  <p>Deeply nested content</p>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.NestedRoot>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.NestedRoot>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

## Common Usage Patterns

### Complete Drawer with All Interactive Components

```typescript
function CompleteDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open Settings</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Handle />
          
          <div className="drawer-header">
            <Drawer.Title>Account Settings</Drawer.Title>
            <Drawer.Description>
              Manage your account preferences and settings
            </Drawer.Description>
            <Drawer.Close>×</Drawer.Close>
          </div>
          
          <div className="drawer-body">
            {/* Settings content */}
            <form>
              {/* Form fields */}
            </form>
          </div>
          
          <div className="drawer-footer">
            <Drawer.Close>Cancel</Drawer.Close>
            <Drawer.Close>Save Changes</Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Accessibility Best Practices

```typescript
function AccessibleDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger aria-label="Open navigation menu">
        Menu
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content aria-describedby="drawer-description">
          <Drawer.Handle aria-label="Drag to resize drawer" />
          
          {/* Always include title for screen readers */}
          <Drawer.Title>Navigation Menu</Drawer.Title>
          
          {/* Description provides context */}
          <Drawer.Description id="drawer-description">
            Main navigation options for the application
          </Drawer.Description>
          
          <nav>
            {/* Navigation items */}
          </nav>
          
          <Drawer.Close aria-label="Close navigation menu">
            Close
          </Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```