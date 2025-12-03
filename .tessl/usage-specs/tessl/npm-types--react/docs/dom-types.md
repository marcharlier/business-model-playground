# DOM Types

Complete HTML and SVG element attribute types, DOM event interfaces, and React-specific DOM enhancements. React provides comprehensive type definitions for all DOM elements and their attributes, ensuring type safety when working with HTML and SVG.

## Capabilities

### Base DOM Attributes

Core DOM attribute interfaces that extend across all elements.

```typescript { .api }
/**
 * Base DOM attributes interface for all elements
 */
interface DOMAttributes<T> {
  children?: ReactNode | undefined;
  dangerouslySetInnerHTML?: {
    __html: string | TrustedHTML;
  } | undefined;

  // Clipboard Events
  onCopy?: ClipboardEventHandler<T> | undefined;
  onCopyCapture?: ClipboardEventHandler<T> | undefined;
  onCut?: ClipboardEventHandler<T> | undefined;
  onCutCapture?: ClipboardEventHandler<T> | undefined;
  onPaste?: ClipboardEventHandler<T> | undefined;
  onPasteCapture?: ClipboardEventHandler<T> | undefined;

  // Composition Events
  onCompositionEnd?: CompositionEventHandler<T> | undefined;
  onCompositionEndCapture?: CompositionEventHandler<T> | undefined;
  onCompositionStart?: CompositionEventHandler<T> | undefined;
  onCompositionStartCapture?: CompositionEventHandler<T> | undefined;
  onCompositionUpdate?: CompositionEventHandler<T> | undefined;
  onCompositionUpdateCapture?: CompositionEventHandler<T> | undefined;

  // Focus Events
  onFocus?: FocusEventHandler<T> | undefined;
  onFocusCapture?: FocusEventHandler<T> | undefined;
  onBlur?: FocusEventHandler<T> | undefined;
  onBlurCapture?: FocusEventHandler<T> | undefined;

  // Form Events
  onChange?: FormEventHandler<T> | undefined;
  onChangeCapture?: FormEventHandler<T> | undefined;
  onBeforeInput?: FormEventHandler<T> | undefined;
  onBeforeInputCapture?: FormEventHandler<T> | undefined;
  onInput?: FormEventHandler<T> | undefined;
  onInputCapture?: FormEventHandler<T> | undefined;
  onReset?: FormEventHandler<T> | undefined;
  onResetCapture?: FormEventHandler<T> | undefined;
  onSubmit?: FormEventHandler<T> | undefined;
  onSubmitCapture?: FormEventHandler<T> | undefined;
  onInvalid?: FormEventHandler<T> | undefined;
  onInvalidCapture?: FormEventHandler<T> | undefined;

  // Image Events
  onLoad?: ReactEventHandler<T> | undefined;
  onLoadCapture?: ReactEventHandler<T> | undefined;
  onError?: ReactEventHandler<T> | undefined;
  onErrorCapture?: ReactEventHandler<T> | undefined;

  // Keyboard Events
  onKeyDown?: KeyboardEventHandler<T> | undefined;
  onKeyDownCapture?: KeyboardEventHandler<T> | undefined;
  onKeyPress?: KeyboardEventHandler<T> | undefined;
  onKeyPressCapture?: KeyboardEventHandler<T> | undefined;
  onKeyUp?: KeyboardEventHandler<T> | undefined;
  onKeyUpCapture?: KeyboardEventHandler<T> | undefined;

  // Media Events
  onAbort?: ReactEventHandler<T> | undefined;
  onAbortCapture?: ReactEventHandler<T> | undefined;
  onCanPlay?: ReactEventHandler<T> | undefined;
  onCanPlayCapture?: ReactEventHandler<T> | undefined;
  onCanPlayThrough?: ReactEventHandler<T> | undefined;
  onCanPlayThroughCapture?: ReactEventHandler<T> | undefined;
  onDurationChange?: ReactEventHandler<T> | undefined;
  onDurationChangeCapture?: ReactEventHandler<T> | undefined;
  onEmptied?: ReactEventHandler<T> | undefined;
  onEmptiedCapture?: ReactEventHandler<T> | undefined;
  onEncrypted?: ReactEventHandler<T> | undefined;
  onEncryptedCapture?: ReactEventHandler<T> | undefined;
  onEnded?: ReactEventHandler<T> | undefined;
  onEndedCapture?: ReactEventHandler<T> | undefined;
  onLoadedData?: ReactEventHandler<T> | undefined;
  onLoadedDataCapture?: ReactEventHandler<T> | undefined;
  onLoadedMetadata?: ReactEventHandler<T> | undefined;
  onLoadedMetadataCapture?: ReactEventHandler<T> | undefined;
  onLoadStart?: ReactEventHandler<T> | undefined;
  onLoadStartCapture?: ReactEventHandler<T> | undefined;
  onPause?: ReactEventHandler<T> | undefined;
  onPauseCapture?: ReactEventHandler<T> | undefined;
  onPlay?: ReactEventHandler<T> | undefined;
  onPlayCapture?: ReactEventHandler<T> | undefined;
  onPlaying?: ReactEventHandler<T> | undefined;
  onPlayingCapture?: ReactEventHandler<T> | undefined;
  onProgress?: ReactEventHandler<T> | undefined;
  onProgressCapture?: ReactEventHandler<T> | undefined;
  onRateChange?: ReactEventHandler<T> | undefined;
  onRateChangeCapture?: ReactEventHandler<T> | undefined;
  onSeeked?: ReactEventHandler<T> | undefined;
  onSeekedCapture?: ReactEventHandler<T> | undefined;
  onSeeking?: ReactEventHandler<T> | undefined;
  onSeekingCapture?: ReactEventHandler<T> | undefined;
  onStalled?: ReactEventHandler<T> | undefined;
  onStalledCapture?: ReactEventHandler<T> | undefined;
  onSuspend?: ReactEventHandler<T> | undefined;
  onSuspendCapture?: ReactEventHandler<T> | undefined;
  onTimeUpdate?: ReactEventHandler<T> | undefined;
  onTimeUpdateCapture?: ReactEventHandler<T> | undefined;
  onVolumeChange?: ReactEventHandler<T> | undefined;
  onVolumeChangeCapture?: ReactEventHandler<T> | undefined;
  onWaiting?: ReactEventHandler<T> | undefined;
  onWaitingCapture?: ReactEventHandler<T> | undefined;

  // MouseEvents
  onAuxClick?: MouseEventHandler<T> | undefined;
  onAuxClickCapture?: MouseEventHandler<T> | undefined;
  onClick?: MouseEventHandler<T> | undefined;
  onClickCapture?: MouseEventHandler<T> | undefined;
  onContextMenu?: MouseEventHandler<T> | undefined;
  onContextMenuCapture?: MouseEventHandler<T> | undefined;
  onDoubleClick?: MouseEventHandler<T> | undefined;
  onDoubleClickCapture?: MouseEventHandler<T> | undefined;
  onDrag?: DragEventHandler<T> | undefined;
  onDragCapture?: DragEventHandler<T> | undefined;
  onDragEnd?: DragEventHandler<T> | undefined;
  onDragEndCapture?: DragEventHandler<T> | undefined;
  onDragEnter?: DragEventHandler<T> | undefined;
  onDragEnterCapture?: DragEventHandler<T> | undefined;
  onDragExit?: DragEventHandler<T> | undefined;
  onDragExitCapture?: DragEventHandler<T> | undefined;
  onDragLeave?: DragEventHandler<T> | undefined;
  onDragLeaveCapture?: DragEventHandler<T> | undefined;
  onDragOver?: DragEventHandler<T> | undefined;
  onDragOverCapture?: DragEventHandler<T> | undefined;
  onDragStart?: DragEventHandler<T> | undefined;
  onDragStartCapture?: DragEventHandler<T> | undefined;
  onDrop?: DragEventHandler<T> | undefined;
  onDropCapture?: DragEventHandler<T> | undefined;
  onMouseDown?: MouseEventHandler<T> | undefined;
  onMouseDownCapture?: MouseEventHandler<T> | undefined;
  onMouseEnter?: MouseEventHandler<T> | undefined;
  onMouseLeave?: MouseEventHandler<T> | undefined;
  onMouseMove?: MouseEventHandler<T> | undefined;
  onMouseMoveCapture?: MouseEventHandler<T> | undefined;
  onMouseOut?: MouseEventHandler<T> | undefined;
  onMouseOutCapture?: MouseEventHandler<T> | undefined;
  onMouseOver?: MouseEventHandler<T> | undefined;
  onMouseOverCapture?: MouseEventHandler<T> | undefined;
  onMouseUp?: MouseEventHandler<T> | undefined;
  onMouseUpCapture?: MouseEventHandler<T> | undefined;

  // Selection Events
  onSelect?: ReactEventHandler<T> | undefined;
  onSelectCapture?: ReactEventHandler<T> | undefined;

  // Touch Events
  onTouchCancel?: TouchEventHandler<T> | undefined;
  onTouchCancelCapture?: TouchEventHandler<T> | undefined;
  onTouchEnd?: TouchEventHandler<T> | undefined;
  onTouchEndCapture?: TouchEventHandler<T> | undefined;
  onTouchMove?: TouchEventHandler<T> | undefined;
  onTouchMoveCapture?: TouchEventHandler<T> | undefined;
  onTouchStart?: TouchEventHandler<T> | undefined;
  onTouchStartCapture?: TouchEventHandler<T> | undefined;

  // Pointer Events
  onPointerDown?: PointerEventHandler<T> | undefined;
  onPointerDownCapture?: PointerEventHandler<T> | undefined;
  onPointerMove?: PointerEventHandler<T> | undefined;
  onPointerMoveCapture?: PointerEventHandler<T> | undefined;
  onPointerUp?: PointerEventHandler<T> | undefined;
  onPointerUpCapture?: PointerEventHandler<T> | undefined;
  onPointerCancel?: PointerEventHandler<T> | undefined;
  onPointerCancelCapture?: PointerEventHandler<T> | undefined;
  onPointerEnter?: PointerEventHandler<T> | undefined;
  onPointerEnterCapture?: PointerEventHandler<T> | undefined;
  onPointerLeave?: PointerEventHandler<T> | undefined;
  onPointerLeaveCapture?: PointerEventHandler<T> | undefined;
  onPointerOver?: PointerEventHandler<T> | undefined;
  onPointerOverCapture?: PointerEventHandler<T> | undefined;
  onPointerOut?: PointerEventHandler<T> | undefined;
  onPointerOutCapture?: PointerEventHandler<T> | undefined;
  onGotPointerCapture?: PointerEventHandler<T> | undefined;
  onGotPointerCaptureCapture?: PointerEventHandler<T> | undefined;
  onLostPointerCapture?: PointerEventHandler<T> | undefined;
  onLostPointerCaptureCapture?: PointerEventHandler<T> | undefined;

  // UI Events
  onScroll?: UIEventHandler<T> | undefined;
  onScrollCapture?: UIEventHandler<T> | undefined;

  // Wheel Events
  onWheel?: WheelEventHandler<T> | undefined;
  onWheelCapture?: WheelEventHandler<T> | undefined;

  // Animation Events
  onAnimationStart?: AnimationEventHandler<T> | undefined;
  onAnimationStartCapture?: AnimationEventHandler<T> | undefined;
  onAnimationEnd?: AnimationEventHandler<T> | undefined;
  onAnimationEndCapture?: AnimationEventHandler<T> | undefined;
  onAnimationIteration?: AnimationEventHandler<T> | undefined;
  onAnimationIterationCapture?: AnimationEventHandler<T> | undefined;

  // Transition Events
  onTransitionEnd?: TransitionEventHandler<T> | undefined;
  onTransitionEndCapture?: TransitionEventHandler<T> | undefined;
}

/**
 * ARIA (Accessibility) attributes
 */
interface AriaAttributes {
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  'aria-activedescendant'?: string | undefined;
  /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
  'aria-atomic'?: Booleanish | undefined;
  /** Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. */
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined;
  /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
  'aria-busy'?: Booleanish | undefined;
  /** Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. */
  'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined;
  /** Defines the total number of columns in a table, grid, or treegrid. */
  'aria-colcount'?: number | undefined;
  /** Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. */
  'aria-colindex'?: number | undefined;
  /** Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. */
  'aria-colspan'?: number | undefined;
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  'aria-controls'?: string | undefined;
  /** Indicates the element that represents the current item within a container or set of related elements. */
  'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time' | undefined;
  /** Identifies the element (or elements) that describes the object. */
  'aria-describedby'?: string | undefined;
  /** Identifies the element that provides a detailed, extended description for the object. */
  'aria-details'?: string | undefined;
  /** Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. */
  'aria-disabled'?: Booleanish | undefined;
  /** Indicates what functions can be performed when a dragged object is released on the drop target. */
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined;
  /** Identifies the element that provides an error message for the object. */
  'aria-errormessage'?: string | undefined;
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  'aria-expanded'?: Booleanish | undefined;
  /** Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. */
  'aria-flowto'?: string | undefined;
  /** Indicates an element's "grabbed" state in a drag-and-drop operation. */
  'aria-grabbed'?: Booleanish | undefined;
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | undefined;
  /** Indicates whether the element is exposed to an accessibility API. */
  'aria-hidden'?: Booleanish | undefined;
  /** Indicates the entered value does not conform to the format expected by the application. */
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined;
  /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
  'aria-keyshortcuts'?: string | undefined;
  /** Defines a string value that labels the current element. */
  'aria-label'?: string | undefined;
  /** Identifies the element (or elements) that labels the current element. */
  'aria-labelledby'?: string | undefined;
  /** Defines the hierarchical level of an element within a structure. */
  'aria-level'?: number | undefined;
  /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
  'aria-live'?: 'off' | 'assertive' | 'polite' | undefined;
  /** Indicates whether an element is modal when displayed. */
  'aria-modal'?: Booleanish | undefined;
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  'aria-multiline'?: Booleanish | undefined;
  /** Indicates that the user may select more than one item from the current selectable descendants. */
  'aria-multiselectable'?: Booleanish | undefined;
  /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
  'aria-orientation'?: 'horizontal' | 'vertical' | undefined;
  /** Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. */
  'aria-owns'?: string | undefined;
  /** Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. */
  'aria-placeholder'?: string | undefined;
  /** Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. */
  'aria-posinset'?: number | undefined;
  /** Indicates the current "pressed" state of toggle buttons. */
  'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined;
  /** Indicates that the element is not editable, but is otherwise operable. */
  'aria-readonly'?: Booleanish | undefined;
  /** Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. */
  'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals' | undefined;
  /** Indicates that user input is required on the element before a form may be submitted. */
  'aria-required'?: Booleanish | undefined;
  /** Defines a human-readable, author-localized description for the role of an element. */
  'aria-roledescription'?: string | undefined;
  /** Defines the total number of rows in a table, grid, or treegrid. */
  'aria-rowcount'?: number | undefined;
  /** Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. */
  'aria-rowindex'?: number | undefined;
  /** Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. */
  'aria-rowspan'?: number | undefined;
  /** Indicates the current "selected" state of various widgets. */
  'aria-selected'?: Booleanish | undefined;
  /** Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. */
  'aria-setsize'?: number | undefined;
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined;
  /** Defines the maximum allowed value for a range widget. */
  'aria-valuemax'?: number | undefined;
  /** Defines the minimum allowed value for a range widget. */
  'aria-valuemin'?: number | undefined;
  /** Defines the current value for a range widget. */
  'aria-valuenow'?: number | undefined;
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  'aria-valuetext'?: string | undefined;
}
```

**Usage Examples:**

```typescript
import React, { DOMAttributes, AriaAttributes } from "react";

// Component using ARIA attributes
const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}> = ({ children, onClick, disabled = false, loading = false }) => {
  const ariaProps: AriaAttributes = {
    'aria-disabled': disabled || loading,
    'aria-busy': loading,
    'aria-label': loading ? 'Loading...' : undefined
  };

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled}
      {...ariaProps}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

// Component with comprehensive DOM attributes
const MediaPlayer: React.FC<{ src: string }> = ({ src }) => {
  const handleTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    console.log('Time update:', event.currentTarget.currentTime);
  };

  const handleLoadedMetadata: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    console.log('Duration:', event.currentTarget.duration);
  };

  const domProps: DOMAttributes<HTMLVideoElement> = {
    onTimeUpdate: handleTimeUpdate,
    onLoadedMetadata: handleLoadedMetadata,
    onPlay: () => console.log('Video playing'),
    onPause: () => console.log('Video paused'),
    onEnded: () => console.log('Video ended')
  };

  return (
    <video
      src={src}
      controls
      width="400"
      height="300"
      {...domProps}
    />
  );
};
```

### HTML Attributes

Comprehensive HTML element attributes with type safety.

```typescript { .api }
/**
 * HTML attributes interface extending DOMAttributes with HTML-specific properties
 */
interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  // Standard HTML Attributes
  accessKey?: string | undefined;
  autoFocus?: boolean | undefined;
  className?: string | undefined;
  contentEditable?: Booleanish | "inherit" | undefined;
  contextMenu?: string | undefined;
  dir?: string | undefined;
  draggable?: Booleanish | undefined;
  hidden?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  nonce?: string | undefined;
  placeholder?: string | undefined;
  slot?: string | undefined;
  spellCheck?: Booleanish | undefined;
  style?: CSSProperties | undefined;
  tabIndex?: number | undefined;
  title?: string | undefined;
  translate?: 'yes' | 'no' | undefined;

  // Unknown
  radioGroup?: string | undefined; // <command>, <menuitem>

  // WAI-ARIA
  role?: AriaRole | undefined;

  // RDFa Attributes
  about?: string | undefined;
  content?: string | undefined;
  datatype?: string | undefined;
  inlist?: any;
  prefix?: string | undefined;
  property?: string | undefined;
  rel?: string | undefined;
  resource?: string | undefined;
  rev?: string | undefined;
  typeof?: string | undefined;
  vocab?: string | undefined;

  // Non-standard Attributes
  autoCapitalize?: string | undefined;
  autoCorrect?: string | undefined;
  autoSave?: string | undefined;
  color?: string | undefined;
  itemProp?: string | undefined;
  itemRef?: string | undefined;
  itemScope?: boolean | undefined;
  itemType?: string | undefined;
  itemID?: string | undefined;
  results?: number | undefined;
  security?: string | undefined;
  unselectable?: 'on' | 'off' | undefined;

  // Living Standard
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
   */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
  /**
   * Specify that a standard HTML element should behave like a defined custom built-in element
   * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
   */
  is?: string | undefined;
}

/**
 * Detailed HTML props combining class attributes and element-specific attributes
 */
type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;
```

**Usage Examples:**

```typescript
import React, { HTMLAttributes, CSSProperties } from "react";

// Component with comprehensive HTML attributes
const Card: React.FC<{
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
} & HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  elevated = false, 
  interactive = false,
  className,
  style,
  ...htmlProps 
}) => {
  const cardStyle: CSSProperties = {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: elevated ? '0 4px 8px rgba(0,0,0,0.1)' : undefined,
    cursor: interactive ? 'pointer' : undefined,
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <div
      className={`card ${className || ''}`}
      style={cardStyle}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...htmlProps}
    >
      {children}
    </div>
  );
};

// Form component with detailed HTML attributes
const FormField: React.FC<{
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  required?: boolean;
  error?: string;
} & Omit<HTMLAttributes<HTMLInputElement>, 'type'>> = ({
  label,
  type = 'text',
  required = false,
  error,
  id,
  className,
  ...inputProps
}) => {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label 
        htmlFor={fieldId}
        className="form-label"
      >
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      
      <input
        type={type}
        id={fieldId}
        className={`form-input ${className || ''}`}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        inputMode={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text'}
        autoCapitalize={type === 'email' ? 'none' : undefined}
        autoCorrect={type === 'email' ? 'off' : undefined}
        spellCheck={type === 'email' || type === 'password' ? false : undefined}
        {...inputProps}
      />
      
      {error && (
        <div 
          id={`${fieldId}-error`}
          className="form-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

// Usage example
const HTMLAttributesExample: React.FC = () => {
  const handleCardClick = () => {
    console.log('Card clicked');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>HTML Attributes Example</h2>
      
      <Card
        elevated
        interactive
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        aria-label="Interactive card"
        data-testid="interactive-card"
        style={{ marginBottom: '16px' }}
      >
        <h3>Interactive Card</h3>
        <p>This card is clickable and keyboard accessible</p>
      </Card>
      
      <form>
        <FormField
          label="Email Address"
          type="email"
          required
          placeholder="your.email@example.com"
          autoComplete="email"
        />
        
        <FormField
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          autoComplete="tel"
        />
        
        <FormField
          label="Website"
          type="url"
          placeholder="https://example.com"
          autoComplete="url"
        />
      </form>
    </div>
  );
};
```

### Specific HTML Element Attributes

Detailed attribute interfaces for specific HTML elements.

```typescript { .api }
/**
 * Input element attributes
 */
interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  accept?: string | undefined;
  alt?: string | undefined;
  autoComplete?: string | undefined;
  capture?: boolean | 'user' | 'environment' | undefined;
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | undefined;
  form?: string | undefined;
  formAction?: string | undefined;
  formEncType?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  height?: number | string | undefined;
  list?: string | undefined;
  max?: number | string | undefined;
  maxLength?: number | undefined;
  min?: number | string | undefined;
  minLength?: number | undefined;
  multiple?: boolean | undefined;
  name?: string | undefined;
  pattern?: string | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  size?: number | undefined;
  src?: string | undefined;
  step?: number | string | undefined;
  type?: HTMLInputTypeAttribute | undefined;
  value?: string | ReadonlyArray<string> | number | undefined;
  width?: number | string | undefined;
}

/**
 * Form element attributes
 */
interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
  acceptCharset?: string | undefined;
  action?: string | undefined;
  autoComplete?: string | undefined;
  encType?: string | undefined;
  method?: string | undefined;
  name?: string | undefined;
  noValidate?: boolean | undefined;
  target?: string | undefined;
}

/**
 * Button element attributes
 */
interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
  disabled?: boolean | undefined;
  form?: string | undefined;
  formAction?: string | undefined;
  formEncType?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  name?: string | undefined;
  type?: 'submit' | 'reset' | 'button' | undefined;
  value?: string | ReadonlyArray<string> | number | undefined;
}

/**
 * Image element attributes
 */
interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
  alt?: string | undefined;
  crossOrigin?: CrossOrigin;
  decoding?: 'async' | 'auto' | 'sync' | undefined;
  height?: number | string | undefined;
  loading?: 'eager' | 'lazy' | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  sizes?: string | undefined;
  src?: string | undefined;
  srcSet?: string | undefined;
  useMap?: string | undefined;
  width?: number | string | undefined;
}

/**
 * Anchor element attributes
 */
interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
  download?: any;
  href?: string | undefined;
  hrefLang?: string | undefined;
  media?: string | undefined;
  ping?: string | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  rel?: string | undefined;
  target?: HTMLAttributeAnchorTarget | undefined;
  type?: string | undefined;
}

/**
 * Video element attributes
 */
interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
  height?: number | string | undefined;
  playsInline?: boolean | undefined;
  poster?: string | undefined;
  width?: number | string | undefined;
  disablePictureInPicture?: boolean | undefined;
  disableRemotePlayback?: boolean | undefined;
}

/**
 * Audio element attributes
 */
interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

/**
 * Media element attributes (base for audio/video)
 */
interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
  autoPlay?: boolean | undefined;
  controls?: boolean | undefined;
  controlsList?: string | undefined;
  crossOrigin?: CrossOrigin;
  loop?: boolean | undefined;
  mediaGroup?: string | undefined;
  muted?: boolean | undefined;
  preload?: string | undefined;
  src?: string | undefined;
}

/**
 * Select element attributes
 */
interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
  autoComplete?: string | undefined;
  disabled?: boolean | undefined;
  form?: string | undefined;
  multiple?: boolean | undefined;
  name?: string | undefined;
  required?: boolean | undefined;
  size?: number | undefined;
  value?: string | ReadonlyArray<string> | number | undefined;
}

/**
 * Textarea element attributes
 */
interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
  autoComplete?: string | undefined;
  cols?: number | undefined;
  dirName?: string | undefined;
  disabled?: boolean | undefined;
  form?: string | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  name?: string | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  rows?: number | undefined;
  value?: string | ReadonlyArray<string> | number | undefined;
  wrap?: string | undefined;
}
```

**Usage Examples:**

```typescript
import React, { 
  InputHTMLAttributes, 
  FormHTMLAttributes, 
  ButtonHTMLAttributes,
  ImgHTMLAttributes,
  VideoHTMLAttributes,
  useState 
} from "react";

// Advanced form with typed attributes
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    newsletter: false,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    console.log('Form submitted:', formData);
  };

  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    required: true,
    autoComplete: 'on',
    spellCheck: true
  };

  const formProps: FormHTMLAttributes<HTMLFormElement> = {
    onSubmit: handleSubmit,
    noValidate: false,
    autoComplete: 'on'
  };

  return (
    <form {...formProps} style={{ maxWidth: '400px', margin: '16px' }}>
      <h2>Contact Form</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          autoComplete="name"
          placeholder="Enter your full name"
          minLength={2}
          maxLength={50}
          {...inputProps}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          autoComplete="email"
          placeholder="your.email@example.com"
          {...inputProps}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            priority: e.target.value as 'low' | 'medium' | 'high'
          }))}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Enter your message..."
          rows={4}
          cols={50}
          minLength={10}
          maxLength={500}
          required
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>
          <input
            type="checkbox"
            checked={formData.newsletter}
            onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
          />
          Subscribe to newsletter
        </label>
      </div>

      <button
        type="submit"
        disabled={!formData.name || !formData.email || !formData.message}
      >
        Send Message
      </button>
    </form>
  );
};

// Media component with comprehensive attributes
const MediaGallery: React.FC = () => {
  const imageProps: ImgHTMLAttributes<HTMLImageElement> = {
    loading: 'lazy',
    decoding: 'async',
    crossOrigin: 'anonymous',
    referrerPolicy: 'no-referrer-when-downgrade'
  };

  const videoProps: VideoHTMLAttributes<HTMLVideoElement> = {
    controls: true,
    preload: 'metadata',
    playsInline: true,
    disablePictureInPicture: false,
    crossOrigin: 'anonymous'
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>Media Gallery</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <h3>Images</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <img
            src="https://picsum.photos/300/200?random=1"
            alt="Random image 1"
            width={300}
            height={200}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            srcSet="
              https://picsum.photos/300/200?random=1 300w,
              https://picsum.photos/600/400?random=1 600w,
              https://picsum.photos/900/600?random=1 900w
            "
            {...imageProps}
          />
          
          <img
            src="https://picsum.photos/300/200?random=2"
            alt="Random image 2"
            width={300}
            height={200}
            {...imageProps}
          />
        </div>
      </div>

      <div>
        <h3>Videos</h3>
        <video
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          width={400}
          height={300}
          poster="https://picsum.photos/400/300?random=3"
          {...videoProps}
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};
```

### SVG Attributes

Complete SVG element attributes for scalable vector graphics.

```typescript { .api }
/**
 * SVG attributes interface
 */
interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  // SVG Attributes
  className?: string | undefined;
  color?: string | undefined;
  height?: number | string | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  max?: number | string | undefined;
  media?: string | undefined;
  method?: string | undefined;
  min?: number | string | undefined;
  name?: string | undefined;
  style?: CSSProperties | undefined;
  target?: string | undefined;
  type?: string | undefined;
  width?: number | string | undefined;

  // Other HTML properties supported by SVG elements in browsers
  role?: AriaRole | undefined;
  tabIndex?: number | undefined;
  crossOrigin?: CrossOrigin;

  // SVG Specific attributes
  accentHeight?: number | string | undefined;
  accumulate?: "none" | "sum" | undefined;
  additive?: "replace" | "sum" | undefined;
  alignmentBaseline?: "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" |
    "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit" | undefined;
  allowReorder?: "no" | "yes" | undefined;
  alphabetic?: number | string | undefined;
  amplitude?: number | string | undefined;
  arabicForm?: "initial" | "medial" | "terminal" | "isolated" | undefined;
  ascent?: number | string | undefined;
  attributeName?: string | undefined;
  attributeType?: string | undefined;
  autoReverse?: Booleanish | undefined;
  azimuth?: number | string | undefined;
  baseFrequency?: number | string | undefined;
  baselineShift?: number | string | undefined;
  baseProfile?: string | undefined;
  bbox?: string | undefined;
  begin?: string | undefined;
  bias?: number | string | undefined;
  by?: number | string | undefined;
  calcMode?: number | string | undefined;
  capHeight?: number | string | undefined;
  clip?: number | string | undefined;
  clipPath?: string | undefined;
  clipPathUnits?: number | string | undefined;
  clipRule?: number | string | undefined;
  colorInterpolation?: number | string | undefined;
  colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit" | undefined;
  colorProfile?: number | string | undefined;
  colorRendering?: number | string | undefined;
  contentScriptType?: number | string | undefined;
  contentStyleType?: number | string | undefined;
  cursor?: number | string | undefined;
  cx?: number | string | undefined;
  cy?: number | string | undefined;
  d?: string | undefined;
  decelerate?: number | string | undefined;
  descent?: number | string | undefined;
  diffuseConstant?: number | string | undefined;
  direction?: number | string | undefined;
  display?: number | string | undefined;
  divisor?: number | string | undefined;
  dominantBaseline?: number | string | undefined;
  dur?: number | string | undefined;
  dx?: number | string | undefined;
  dy?: number | string | undefined;
  edgeMode?: number | string | undefined;
  elevation?: number | string | undefined;
  enableBackground?: number | string | undefined;
  end?: number | string | undefined;
  exponent?: number | string | undefined;
  externalResourcesRequired?: Booleanish | undefined;
  fill?: string | undefined;
  fillOpacity?: number | string | undefined;
  fillRule?: "nonzero" | "evenodd" | "inherit" | undefined;
  filter?: string | undefined;
  filterRes?: number | string | undefined;
  filterUnits?: number | string | undefined;
  floodColor?: number | string | undefined;
  floodOpacity?: number | string | undefined;
  focusable?: Booleanish | "auto" | undefined;
  fontFamily?: string | undefined;
  fontSize?: number | string | undefined;
  fontSizeAdjust?: number | string | undefined;
  fontStretch?: number | string | undefined;
  fontStyle?: number | string | undefined;
  fontVariant?: number | string | undefined;
  fontWeight?: number | string | undefined;
  format?: number | string | undefined;
  fr?: number | string | undefined;
  from?: number | string | undefined;
  fx?: number | string | undefined;
  fy?: number | string | undefined;
  g1?: number | string | undefined;
  g2?: number | string | undefined;
  glyphName?: number | string | undefined;
  glyphOrientationHorizontal?: number | string | undefined;
  glyphOrientationVertical?: number | string | undefined;
  glyphRef?: number | string | undefined;
  gradientTransform?: string | undefined;
  gradientUnits?: string | undefined;
  hanging?: number | string | undefined;
  horizAdvX?: number | string | undefined;
  horizOriginX?: number | string | undefined;
  href?: string | undefined;
  ideographic?: number | string | undefined;
  imageRendering?: number | string | undefined;
  in2?: number | string | undefined;
  in?: string | undefined;
  intercept?: number | string | undefined;
  k1?: number | string | undefined;
  k2?: number | string | undefined;
  k3?: number | string | undefined;
  k4?: number | string | undefined;
  k?: number | string | undefined;
  kernelMatrix?: number | string | undefined;
  kernelUnitLength?: number | string | undefined;
  kerning?: number | string | undefined;
  keyPoints?: number | string | undefined;
  keySplines?: number | string | undefined;
  keyTimes?: number | string | undefined;
  lengthAdjust?: number | string | undefined;
  letterSpacing?: number | string | undefined;
  lightingColor?: number | string | undefined;
  limitingConeAngle?: number | string | undefined;
  local?: number | string | undefined;
  markerEnd?: string | undefined;
  markerHeight?: number | string | undefined;
  markerMid?: string | undefined;
  markerStart?: string | undefined;
  markerUnits?: number | string | undefined;
  markerWidth?: number | string | undefined;
  mask?: string | undefined;
  maskContentUnits?: number | string | undefined;
  maskUnits?: number | string | undefined;
  mathematical?: number | string | undefined;
  mode?: number | string | undefined;
  numOctaves?: number | string | undefined;
  offset?: number | string | undefined;
  opacity?: number | string | undefined;
  operator?: number | string | undefined;
  order?: number | string | undefined;
  orient?: number | string | undefined;
  orientation?: number | string | undefined;
  origin?: number | string | undefined;
  overflow?: number | string | undefined;
  overlinePosition?: number | string | undefined;
  overlineThickness?: number | string | undefined;
  paintOrder?: number | string | undefined;
  panose1?: number | string | undefined;
  path?: string | undefined;
  pathLength?: number | string | undefined;
  patternContentUnits?: string | undefined;
  patternTransform?: number | string | undefined;
  patternUnits?: string | undefined;
  pointerEvents?: number | string | undefined;
  points?: string | undefined;
  pointsAtX?: number | string | undefined;
  pointsAtY?: number | string | undefined;
  pointsAtZ?: number | string | undefined;
  preserveAlpha?: Booleanish | undefined;
  preserveAspectRatio?: string | undefined;
  primitiveUnits?: number | string | undefined;
  r?: number | string | undefined;
  radius?: number | string | undefined;
  refX?: number | string | undefined;
  refY?: number | string | undefined;
  renderingIntent?: number | string | undefined;
  repeatCount?: number | string | undefined;
  repeatDur?: number | string | undefined;
  requiredExtensions?: number | string | undefined;
  requiredFeatures?: number | string | undefined;
  restart?: number | string | undefined;
  result?: string | undefined;
  rotate?: number | string | undefined;
  rx?: number | string | undefined;
  ry?: number | string | undefined;
  scale?: number | string | undefined;
  seed?: number | string | undefined;
  shapeRendering?: number | string | undefined;
  slope?: number | string | undefined;
  spacing?: number | string | undefined;
  specularConstant?: number | string | undefined;
  specularExponent?: number | string | undefined;
  speed?: number | string | undefined;
  spreadMethod?: string | undefined;
  startOffset?: number | string | undefined;
  stdDeviation?: number | string | undefined;
  stemh?: number | string | undefined;
  stemv?: number | string | undefined;
  stitchTiles?: number | string | undefined;
  stopColor?: string | undefined;
  stopOpacity?: number | string | undefined;
  strikethroughPosition?: number | string | undefined;
  strikethroughThickness?: number | string | undefined;
  string?: number | string | undefined;
  stroke?: string | undefined;
  strokeDasharray?: string | number | undefined;
  strokeDashoffset?: string | number | undefined;
  strokeLinecap?: "butt" | "round" | "square" | "inherit" | undefined;
  strokeLinejoin?: "miter" | "round" | "bevel" | "inherit" | undefined;
  strokeMiterlimit?: number | string | undefined;
  strokeOpacity?: number | string | undefined;
  strokeWidth?: number | string | undefined;
  surfaceScale?: number | string | undefined;
  systemLanguage?: number | string | undefined;
  tableValues?: number | string | undefined;
  targetX?: number | string | undefined;
  targetY?: number | string | undefined;
  textAnchor?: string | undefined;
  textDecoration?: number | string | undefined;
  textLength?: number | string | undefined;
  textRendering?: number | string | undefined;
  to?: number | string | undefined;
  transform?: string | undefined;
  u1?: number | string | undefined;
  u2?: number | string | undefined;
  underlinePosition?: number | string | undefined;
  underlineThickness?: number | string | undefined;
  unicode?: number | string | undefined;
  unicodeBidi?: number | string | undefined;
  unicodeRange?: number | string | undefined;
  unitsPerEm?: number | string | undefined;
  vAlphabetic?: number | string | undefined;
  values?: string | undefined;
  vectorEffect?: number | string | undefined;
  version?: string | undefined;
  vertAdvY?: number | string | undefined;
  vertOriginX?: number | string | undefined;
  vertOriginY?: number | string | undefined;
  vHanging?: number | string | undefined;
  vIdeographic?: number | string | undefined;
  viewBox?: string | undefined;
  viewTarget?: number | string | undefined;
  visibility?: number | string | undefined;
  vMathematical?: number | string | undefined;
  wordSpacing?: number | string | undefined;
  writingMode?: number | string | undefined;
  x1?: number | string | undefined;
  x2?: number | string | undefined;
  x?: number | string | undefined;
  xChannelSelector?: string | undefined;
  xHeight?: number | string | undefined;
  xlinkActuate?: string | undefined;
  xlinkArcrole?: string | undefined;
  xlinkHref?: string | undefined;
  xlinkRole?: string | undefined;
  xlinkShow?: string | undefined;
  xlinkTitle?: string | undefined;
  xlinkType?: string | undefined;
  xmlBase?: string | undefined;
  xmlLang?: string | undefined;
  xmlns?: string | undefined;
  xmlnsXlink?: string | undefined;
  xmlSpace?: string | undefined;
  y1?: number | string | undefined;
  y2?: number | string | undefined;
  y?: number | string | undefined;
  yChannelSelector?: string | undefined;
  z?: number | string | undefined;
  zoomAndPan?: string | undefined;
}
```

**Usage Examples:**

```typescript
import React, { SVGAttributes } from "react";

// SVG Icon Component
const Icon: React.FC<{
  name: string;
  size?: number;
  color?: string;
} & SVGAttributes<SVGSVGElement>> = ({ 
  name, 
  size = 24, 
  color = 'currentColor',
  ...svgProps 
}) => {
  const iconPaths: Record<string, string> = {
    heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...svgProps}
    >
      <path d={iconPaths[name]} fill={name === 'heart' ? color : 'none'} />
    </svg>
  );
};

// Complex SVG Chart Component
const BarChart: React.FC<{
  data: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  color?: string;
}> = ({ data, width = 400, height = 200, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 60) / data.length - 10;
  const chartHeight = height - 60;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ border: '1px solid #e5e7eb' }}
      aria-labelledby="chart-title"
      role="img"
    >
      <title id="chart-title">Bar chart showing data values</title>
      
      {/* Grid lines */}
      <g stroke="#e5e7eb" strokeWidth={1}>
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={50}
            y1={30 + chartHeight * ratio}
            x2={width - 10}
            y2={30 + chartHeight * ratio}
            strokeDasharray="3,3"
          />
        ))}
      </g>

      {/* Bars */}
      <g>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = 60 + index * (barWidth + 10);
          const y = 30 + chartHeight - barHeight;
          
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                stroke="none"
                rx={2}
              />
              <text
                x={x + barWidth / 2}
                y={height - 20}
                textAnchor="middle"
                fontSize={12}
                fill="#374151"
              >
                {item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize={10}
                fill="#374151"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </g>

      {/* Y-axis labels */}
      <g>
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <text
            key={ratio}
            x={40}
            y={35 + chartHeight * (1 - ratio)}
            textAnchor="end"
            fontSize={10}
            fill="#6b7280"
          >
            {Math.round(maxValue * ratio)}
          </text>
        ))}
      </g>
    </svg>
  );
};

// SVG Usage Example
const SVGExample: React.FC = () => {
  const chartData = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 78 },
    { label: 'Mar', value: 42 },
    { label: 'Apr', value: 89 },
    { label: 'May', value: 95 }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <h2>SVG Components Example</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <h3>Icons</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Icon name="heart" size={32} color="#ef4444" />
          <Icon name="star" size={32} color="#fbbf24" />
          <Icon name="check" size={32} color="#10b981" />
        </div>
      </div>

      <div>
        <h3>Chart</h3>
        <BarChart data={chartData} />
      </div>
    </div>
  );
};
```

## Types

### DOM Type Definitions

```typescript { .api }
// CSS Properties (from csstype)
interface CSSProperties extends CSS.Properties<string | number> {
  /**
   * The index signature was removed to enable closed typing for style
   * using CSSType. You're able to use type assertion or module augmentation
   * to add properties or an index signature of your own.
   *
   * For examples and more information, visit:
   * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
   */
}

// Common attribute types
type Booleanish = boolean | 'true' | 'false';
type CrossOrigin = 'anonymous' | 'use-credentials' | '' | undefined;

// HTML Input types
type HTMLInputTypeAttribute =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

// HTML attribute types
type HTMLAttributeReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top' | (string & {});

// ARIA Role type
type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem'
  | (string & {});

// React HTML and SVG element types
interface ReactHTML {
  a: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  abbr: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  address: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  area: DetailedHTMLProps<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  article: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  aside: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  audio: DetailedHTMLProps<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  b: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  base: DetailedHTMLProps<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  bdi: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  bdo: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  big: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  blockquote: DetailedHTMLProps<BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  body: DetailedHTMLProps<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  br: DetailedHTMLProps<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  button: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  canvas: DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  caption: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  center: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  cite: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  code: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  col: DetailedHTMLProps<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  colgroup: DetailedHTMLProps<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  data: DetailedHTMLProps<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
  datalist: DetailedHTMLProps<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  dd: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  del: DetailedHTMLProps<DelHTMLAttributes<HTMLModElement>, HTMLModElement>;
  details: DetailedHTMLProps<DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>;
  dfn: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  dialog: DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  div: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  dl: DetailedHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  dt: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  em: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  embed: DetailedHTMLProps<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  fieldset: DetailedHTMLProps<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  figcaption: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  figure: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  footer: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  form: DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  h1: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h2: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h3: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h4: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h5: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h6: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  head: DetailedHTMLProps<HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
  header: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  hgroup: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  hr: DetailedHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  html: DetailedHTMLProps<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  i: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  iframe: DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  img: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  input: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  ins: DetailedHTMLProps<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  kbd: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  keygen: DetailedHTMLProps<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  label: DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  legend: DetailedHTMLProps<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  li: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  link: DetailedHTMLProps<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  main: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  map: DetailedHTMLProps<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  mark: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  menu: DetailedHTMLProps<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  menuitem: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  meta: DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  meter: DetailedHTMLProps<MeterHTMLAttributes<HTMLMeterElement>, HTMLMeterElement>;
  nav: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  noindex: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  noscript: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  object: DetailedHTMLProps<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  ol: DetailedHTMLProps<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  optgroup: DetailedHTMLProps<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  option: DetailedHTMLProps<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  output: DetailedHTMLProps<OutputHTMLAttributes<HTMLOutputElement>, HTMLOutputElement>;
  p: DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  param: DetailedHTMLProps<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  picture: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  pre: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  progress: DetailedHTMLProps<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  q: DetailedHTMLProps<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  rp: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  rt: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  ruby: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  s: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  samp: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  slot: DetailedHTMLProps<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
  script: DetailedHTMLProps<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  section: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  select: DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  small: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  source: DetailedHTMLProps<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  span: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  strong: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  style: DetailedHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  sub: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  summary: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  sup: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  table: DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  template: DetailedHTMLProps<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
  tbody: DetailedHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  td: DetailedHTMLProps<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  textarea: DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  tfoot: DetailedHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  th: DetailedHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  thead: DetailedHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  time: DetailedHTMLProps<TimeHTMLAttributes<HTMLTimeElement>, HTMLTimeElement>;
  title: DetailedHTMLProps<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  tr: DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  track: DetailedHTMLProps<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  u: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  ul: DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  var: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  video: DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  wbr: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
  webview: DetailedHTMLProps<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;
}

interface ReactSVG {
  animate: SVGProps<SVGElement>;
  animateMotion: SVGProps<SVGElement>;
  animateTransform: SVGProps<SVGElement>;
  circle: SVGProps<SVGCircleElement>;
  clipPath: SVGProps<SVGClipPathElement>;
  defs: SVGProps<SVGDefsElement>;
  desc: SVGProps<SVGDescElement>;
  ellipse: SVGProps<SVGEllipseElement>;
  feBlend: SVGProps<SVGFEBlendElement>;
  feColorMatrix: SVGProps<SVGFEColorMatrixElement>;
  feComponentTransfer: SVGProps<SVGFEComponentTransferElement>;
  feComposite: SVGProps<SVGFECompositeElement>;
  feConvolveMatrix: SVGProps<SVGFEConvolveMatrixElement>;
  feDiffuseLighting: SVGProps<SVGFEDiffuseLightingElement>;
  feDisplacementMap: SVGProps<SVGFEDisplacementMapElement>;
  feDistantLight: SVGProps<SVGFEDistantLightElement>;
  feDropShadow: SVGProps<SVGFEDropShadowElement>;
  feFlood: SVGProps<SVGFEFloodElement>;
  feFuncA: SVGProps<SVGFEFuncAElement>;
  feFuncB: SVGProps<SVGFEFuncBElement>;
  feFuncG: SVGProps<SVGFEFuncGElement>;
  feFuncR: SVGProps<SVGFEFuncRElement>;
  feGaussianBlur: SVGProps<SVGFEGaussianBlurElement>;
  feImage: SVGProps<SVGFEImageElement>;
  feMerge: SVGProps<SVGFEMergeElement>;
  feMergeNode: SVGProps<SVGFEMergeNodeElement>;
  feMorphology: SVGProps<SVGFEMorphologyElement>;
  feOffset: SVGProps<SVGFEOffsetElement>;
  fePointLight: SVGProps<SVGFEPointLightElement>;
  feSpecularLighting: SVGProps<SVGFESpecularLightingElement>;
  feSpotLight: SVGProps<SVGFESpotLightElement>;
  feTile: SVGProps<SVGFETileElement>;
  feTurbulence: SVGProps<SVGFETurbulenceElement>;
  filter: SVGProps<SVGFilterElement>;
  foreignObject: SVGProps<SVGForeignObjectElement>;
  g: SVGProps<SVGGElement>;
  image: SVGProps<SVGImageElement>;
  line: SVGProps<SVGLineElement>;
  linearGradient: SVGProps<SVGLinearGradientElement>;
  marker: SVGProps<SVGMarkerElement>;
  mask: SVGProps<SVGMaskElement>;
  metadata: SVGProps<SVGMetadataElement>;
  mpath: SVGProps<SVGElement>;
  path: SVGProps<SVGPathElement>;
  pattern: SVGProps<SVGPatternElement>;
  polygon: SVGProps<SVGPolygonElement>;
  polyline: SVGProps<SVGPolylineElement>;
  radialGradient: SVGProps<SVGRadialGradientElement>;
  rect: SVGProps<SVGRectElement>;
  stop: SVGProps<SVGStopElement>;
  style: SVGProps<SVGStyleElement>;
  svg: SVGProps<SVGSVGElement>;
  switch: SVGProps<SVGSwitchElement>;
  symbol: SVGProps<SVGSymbolElement>;
  text: SVGProps<SVGTextElement>;
  textPath: SVGProps<SVGTextPathElement>;
  tspan: SVGProps<SVGTSpanElement>;
  use: SVGProps<SVGUseElement>;
  view: SVGProps<SVGViewElement>;
}

// SVG props convenience type
type SVGProps<T> = ClassAttributes<T> & SVGAttributes<T>;

// React element types
type ReactHTMLElement<T extends keyof ReactHTML> = DetailedReactHTMLElement<
  ComponentPropsWithoutRef<ReactHTML[T]['type']>,
  T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element
>;

interface DetailedReactHTMLElement<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMElement<P, T> {
  type: keyof ReactHTML;
}

interface ReactSVGElement extends DOMElement<SVGAttributes<SVGElement>, SVGElement> {
  type: keyof ReactSVG;
}

interface DOMElement<P extends HTMLAttributes<T> | SVGAttributes<T>, T extends Element> extends ReactElement<P, string> {
  ref: LegacyRef<T>;
}
```