# Testing Utilities

Comprehensive testing utilities for component inspection, tree traversal, event simulation, and advanced debugging capabilities. These utilities help test React components by providing programmatic access to component trees and DOM events.

## Entry Points

- `react-dom/test-utils` - Standard testing utilities (mostly deprecated in favor of modern testing libraries)
- `react-dom/unstable_testing` - Experimental testing APIs for advanced debugging

## Component Type Checking

Utilities for checking component and element types within rendered trees.

```javascript { .api }
/**
 * Checks if a value is a React element
 * @param element - Value to check
 * @returns True if the value is a React element
 */
function isElement(element: any): boolean;

/**
 * Checks if an element is of a specific component type
 * @param element - React element to check
 * @param componentType - Component type to match against
 * @returns True if element matches the component type
 */
function isElementOfType(element: ReactElement, componentType: ComponentType): boolean;

/**
 * Checks if an instance is a DOM component
 * @param instance - Component instance to check
 * @returns True if instance is a DOM component
 */
function isDOMComponent(instance: ReactComponent): boolean;

/**
 * Checks if an element represents a DOM component
 * @param element - React element to check
 * @returns True if element represents a DOM component
 */
function isDOMComponentElement(element: ReactElement): boolean;

/**
 * Checks if an instance is a composite component
 * @param instance - Component instance to check
 * @returns True if instance is a composite component
 */
function isCompositeComponent(instance: ReactComponent): boolean;

/**
 * Checks if a composite component is of a specific type
 * @param instance - Component instance to check
 * @param type - Component type to match against
 * @returns True if instance matches the component type
 */
function isCompositeComponentWithType(instance: ReactComponent, type: ComponentType): boolean;
```

**Usage Examples:**

```javascript
import * as TestUtils from "react-dom/test-utils";

// Check element types
const element = <div>Hello</div>;
console.log(TestUtils.isElement(element)); // true
console.log(TestUtils.isElementOfType(element, "div")); // true

// Check component instances
const component = TestUtils.renderIntoDocument(<MyComponent />);
console.log(TestUtils.isCompositeComponent(component)); // true
console.log(TestUtils.isCompositeComponentWithType(component, MyComponent)); // true
```

## Tree Traversal and Finding

Utilities for searching and traversing rendered component trees.

```javascript { .api }
/**
 * Finds all instances in the tree that match the test function
 * @param tree - Component tree to search
 * @param test - Function that returns true for matching instances
 * @returns Array of matching instances
 */
function findAllInRenderedTree(tree: ReactComponent, test: (instance: ReactComponent) => boolean): Array<ReactComponent>;

/**
 * Finds DOM components by CSS class name
 * @param tree - Component tree to search
 * @param className - CSS class name to search for
 * @returns Array of matching DOM elements
 */
function scryRenderedDOMComponentsWithClass(tree: ReactComponent, className: string): Array<Element>;

/**
 * Finds single DOM component by CSS class name
 * @param tree - Component tree to search
 * @param className - CSS class name to search for
 * @returns Single matching DOM element
 * @throws Error if zero or multiple matches found
 */
function findRenderedDOMComponentWithClass(tree: ReactComponent, className: string): Element;

/**
 * Finds DOM components by tag name
 * @param tree - Component tree to search
 * @param tagName - HTML tag name to search for
 * @returns Array of matching DOM elements
 */
function scryRenderedDOMComponentsWithTag(tree: ReactComponent, tagName: string): Array<Element>;

/**
 * Finds single DOM component by tag name
 * @param tree - Component tree to search
 * @param tagName - HTML tag name to search for
 * @returns Single matching DOM element
 * @throws Error if zero or multiple matches found
 */
function findRenderedDOMComponentWithTag(tree: ReactComponent, tagName: string): Element;

/**
 * Finds components by React component type
 * @param tree - Component tree to search
 * @param type - React component type to search for
 * @returns Array of matching component instances
 */
function scryRenderedComponentsWithType(tree: ReactComponent, type: ComponentType): Array<ReactComponent>;

/**
 * Finds single component by React component type
 * @param tree - Component tree to search
 * @param type - React component type to search for
 * @returns Single matching component instance
 * @throws Error if zero or multiple matches found
 */
function findRenderedComponentWithType(tree: ReactComponent, type: ComponentType): ReactComponent;
```

**Usage Examples:**

```javascript
import * as TestUtils from "react-dom/test-utils";

// Render component for testing
const tree = TestUtils.renderIntoDocument(
  <div>
    <button className="primary">Submit</button>
    <input type="text" />
    <MyComponent />
  </div>
);

// Find by class name
const button = TestUtils.findRenderedDOMComponentWithClass(tree, "primary");
console.log(button.textContent); // "Submit"

// Find by tag name
const input = TestUtils.findRenderedDOMComponentWithTag(tree, "input");
console.log(input.type); // "text"

// Find by component type
const myComponent = TestUtils.findRenderedComponentWithType(tree, MyComponent);

// Find multiple elements
const allButtons = TestUtils.scryRenderedDOMComponentsWithTag(tree, "button");
console.log(allButtons.length); // Number of button elements

// Custom search
const textInputs = TestUtils.findAllInRenderedTree(tree, (instance) => {
  return TestUtils.isDOMComponent(instance) && 
         instance.tagName === "INPUT" && 
         instance.type === "text";
});
```

## Event Simulation

The `Simulate` object provides methods for programmatically triggering DOM events on elements.

```javascript { .api }
const Simulate: {
  // Mouse events
  click(element: Element, eventData?: Object): void;
  doubleClick(element: Element, eventData?: Object): void;
  mouseDown(element: Element, eventData?: Object): void;
  mouseUp(element: Element, eventData?: Object): void;
  mouseMove(element: Element, eventData?: Object): void;
  mouseOver(element: Element, eventData?: Object): void;
  mouseOut(element: Element, eventData?: Object): void;
  mouseEnter(element: Element, eventData?: Object): void;
  mouseLeave(element: Element, eventData?: Object): void;
  
  // Keyboard events
  keyDown(element: Element, eventData?: Object): void;
  keyUp(element: Element, eventData?: Object): void;
  keyPress(element: Element, eventData?: Object): void;
  
  // Form events
  change(element: Element, eventData?: Object): void;
  input(element: Element, eventData?: Object): void;
  submit(element: Element, eventData?: Object): void;
  focus(element: Element, eventData?: Object): void;
  blur(element: Element, eventData?: Object): void;
  
  // Touch events
  touchStart(element: Element, eventData?: Object): void;
  touchMove(element: Element, eventData?: Object): void;
  touchEnd(element: Element, eventData?: Object): void;
  touchCancel(element: Element, eventData?: Object): void;
  
  // Drag events
  drag(element: Element, eventData?: Object): void;
  dragStart(element: Element, eventData?: Object): void;
  dragEnd(element: Element, eventData?: Object): void;
  dragEnter(element: Element, eventData?: Object): void;
  dragLeave(element: Element, eventData?: Object): void;
  dragOver(element: Element, eventData?: Object): void;
  drop(element: Element, eventData?: Object): void;
  
  // Scroll events
  scroll(element: Element, eventData?: Object): void;
  
  // And 60+ other DOM event types...
};
```

**Usage Examples:**

```javascript
import * as TestUtils from "react-dom/test-utils";

// Render component
const tree = TestUtils.renderIntoDocument(<MyForm />);

// Find form elements
const input = TestUtils.findRenderedDOMComponentWithTag(tree, "input");
const button = TestUtils.findRenderedDOMComponentWithTag(tree, "button");

// Simulate user interactions
TestUtils.Simulate.change(input, { target: { value: "test value" } });
TestUtils.Simulate.focus(input);
TestUtils.Simulate.keyDown(input, { key: "Enter", keyCode: 13 });
TestUtils.Simulate.click(button);

// Mouse events with coordinates
TestUtils.Simulate.mouseOver(button, {
  clientX: 100,
  clientY: 200
});

// Form submission
const form = TestUtils.findRenderedDOMComponentWithTag(tree, "form");
TestUtils.Simulate.submit(form);

// Custom event data
TestUtils.Simulate.change(input, {
  target: { value: "new value" },
  preventDefault: () => {},
  stopPropagation: () => {}
});
```

## Legacy Testing Utilities

These utilities are deprecated but still available for backward compatibility:

```javascript { .api }
/**
 * Renders element into the document (deprecated)
 * @deprecated Use modern testing libraries like @testing-library/react
 */
function renderIntoDocument(element: ReactElement): ReactComponent;

/**
 * Creates a mock component (deprecated)
 * @deprecated Use modern mocking approaches
 */
function mockComponent(module: any, mockTagName?: string): Function;

/**
 * Wraps updates for testing (deprecated)
 * @deprecated Use React.act instead
 */
function act(callback: () => void): void;
```

## Utility Functions

Additional utility functions for testing scenarios:

```javascript { .api }
/**
 * Creates touch event data for testing
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Touch event data object
 */
function nativeTouchData(x: number, y: number): Object;

/**
 * Internal utility for event traversal
 * @param instance - Component instance
 * @param fn - Function to call for each phase
 * @param arg - Argument to pass to function
 */
function traverseTwoPhase(instance: ReactComponent, fn: Function, arg: any): void;
```

## Experimental Testing APIs

Advanced testing capabilities available through `react-dom/unstable_testing`:

```javascript { .api }
// Component selection for advanced testing
function createComponentSelector(): ComponentSelector;
function createHasPseudoClassSelector(): PseudoClassSelector;
function createRoleSelector(): RoleSelector;
function createTestNameSelector(): TestNameSelector;
function createTextSelector(): TextSelector;

// Advanced inspection APIs
function getFindAllNodesFailureDescription(): string;
function findAllNodes(): Array<Node>;
function findBoundingRects(): Array<DOMRect>;
function focusWithin(): void;
function observeVisibleRects(): void;
```

**Usage Examples:**

```javascript
import {
  createTextSelector,
  createRoleSelector,
  findAllNodes
} from "react-dom/unstable_testing";

// Advanced selectors for modern testing
const textSelector = createTextSelector("Submit");
const roleSelector = createRoleSelector("button");
const nodes = findAllNodes();
```

## Migration Guide

**From React DOM Test Utils to Modern Testing:**

```javascript
// Old approach (deprecated)
import * as TestUtils from "react-dom/test-utils";

const tree = TestUtils.renderIntoDocument(<MyComponent />);
const button = TestUtils.findRenderedDOMComponentWithTag(tree, "button");
TestUtils.Simulate.click(button);

// Modern approach (recommended)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

render(<MyComponent />);
const button = screen.getByRole("button");
await userEvent.click(button);
```

**Key Differences:**
- Modern libraries provide better async support
- More semantic queries (by role, label, text)
- Better accessibility testing support
- Cleaner API design
- Active maintenance and community support

## Integration with Modern Testing

While React DOM test utilities are mostly deprecated, they can still be useful in specific scenarios:

```javascript
import { render } from "@testing-library/react";
import * as TestUtils from "react-dom/test-utils";

// Render with modern library
const { container } = render(<MyComponent />);

// Use legacy utils for specific needs
const allComponents = TestUtils.findAllInRenderedTree(
  container.firstChild,
  (instance) => TestUtils.isCompositeComponent(instance)
);
```