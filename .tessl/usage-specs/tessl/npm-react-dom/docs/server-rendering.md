# Server-Side Rendering

Comprehensive server-side rendering support for both Node.js and browser environments, with legacy string/stream APIs and modern streaming with Suspense support.

## Entry Points

React DOM provides different server entry points optimized for different environments:

- `react-dom/server` - Node.js server rendering with full stream support
- `react-dom/server.browser` - Browser-compatible server rendering (limited streaming)

## Capabilities

### String Rendering

Renders React elements to static HTML strings, suitable for simple server-side rendering without streaming.

```javascript { .api }
/**
 * Renders React elements to an HTML string
 * @param element - React elements to render
 * @param options - Optional server rendering configuration
 * @returns HTML string representation
 */
function renderToString(element: ReactNodeList, options?: ServerOptions): string;

/**
 * Renders React elements to static HTML without React attributes
 * @param element - React elements to render
 * @param options - Optional server rendering configuration
 * @returns Static HTML string without React-specific attributes
 */
function renderToStaticMarkup(element: ReactNodeList, options?: ServerOptions): string;

interface ServerOptions {
  /** Prefix for server-generated element IDs */
  identifierPrefix?: string;
}
```

**Usage Examples:**

```javascript
import { renderToString, renderToStaticMarkup } from "react-dom/server";

// Basic server rendering with React attributes
const html = renderToString(<App />);
console.log(html); // '<div data-reactroot="">...</div>'

// Static HTML without React attributes (for emails, static sites)
const staticHtml = renderToStaticMarkup(<EmailTemplate />);
console.log(staticHtml); // '<div>...</div>'

// With custom identifier prefix
const html = renderToString(<App />, {
  identifierPrefix: "my-server-app"
});
```

### Node.js Stream Rendering (Legacy)

Legacy streaming APIs for Node.js environments using Node.js Readable streams.

```javascript { .api }
/**
 * Renders to a Node.js Readable stream (legacy)
 * @param element - React elements to render
 * @param options - Optional server rendering configuration
 * @returns Node.js Readable stream
 */
function renderToNodeStream(element: ReactNodeList, options?: ServerOptions): Readable;

/**
 * Renders static markup to a Node.js Readable stream (legacy)
 * @param element - React elements to render
 * @param options - Optional server rendering configuration
 * @returns Node.js Readable stream with static HTML
 */
function renderToStaticNodeStream(element: ReactNodeList, options?: ServerOptions): Readable;
```

**Usage Examples:**

```javascript
import { renderToNodeStream } from "react-dom/server";
import { pipeline } from "stream";

// Stream to HTTP response
const stream = renderToNodeStream(<App />);
pipeline(stream, response, (err) => {
  if (err) {
    console.error("Streaming failed:", err);
    response.statusCode = 500;
    response.end();
  }
});
```

### Modern Streaming (Node.js)

Modern streaming API with Suspense support and better control over the streaming process.

```javascript { .api }
/**
 * Renders to a pipeable stream with Suspense support
 * @param children - React elements to render
 * @param options - Streaming configuration and callbacks
 * @returns Object with pipe() and abort() methods
 */
function renderToPipeableStream(
  children: ReactNodeList,
  options?: PipeableStreamOptions
): PipeableStream;

interface PipeableStreamOptions {
  /** Called when the shell is ready to stream */
  onShellReady?: () => void;
  /** Called when there's an error in the shell */
  onShellError?: (error: mixed) => void;
  /** Called when all content is ready */
  onAllReady?: () => void;
  /** Called when there's any error during rendering */
  onError?: (error: mixed) => void;
  /** Custom identifier prefix */
  identifierPrefix?: string;
  /** Nonce for Content Security Policy */
  nonce?: string;
  /** Scripts to include in the HTML */
  bootstrapScripts?: Array<string>;
  /** Script modules to include */
  bootstrapScriptContent?: string;
  /** Bootstrap modules */
  bootstrapModules?: Array<string>;
  /** Import map for modules */
  importMap?: string;
  /** Custom error handling */
  onErrorShell?: (error: mixed) => void;
  /** Progressive enhancement mode */
  progressiveChunkSize?: number;
}

interface PipeableStream {
  /** Pipe the stream to a writable destination */
  pipe<T extends NodeJS.WritableStream>(destination: T): T;
  /** Abort the streaming process */
  abort(): void;
}
```

**Usage Examples:**

```javascript
import { renderToPipeableStream } from "react-dom/server";

// Basic streaming
const { pipe, abort } = renderToPipeableStream(<App />, {
  onShellReady() {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html");
    pipe(response);
  },
  onShellError(error) {
    response.statusCode = 500;
    response.setHeader("Content-Type", "text/html");
    response.send("<h1>Something went wrong</h1>");
  },
  onError(error) {
    console.error("Streaming error:", error);
  }
});

// With custom scripts and CSP
const { pipe } = renderToPipeableStream(<App />, {
  bootstrapScripts: ["/static/js/main.js"],
  nonce: "random-nonce-value",
  onShellReady() {
    pipe(response);
  }
});

// Handle request timeout
const timeout = setTimeout(() => {
  abort();
  response.statusCode = 500;
  response.end();
}, 10000);

// Clean up timeout when done
response.on("finish", () => clearTimeout(timeout));
```

### Browser Streaming

Web Streams compatible streaming for browser environments and edge runtimes.

```javascript { .api }
/**
 * Renders to a Web Streams ReadableStream
 * @param children - React elements to render
 * @param options - Browser streaming configuration
 * @returns Promise resolving to ReadableStream
 */
function renderToReadableStream(
  children: ReactNodeList,
  options?: ReadableStreamOptions
): Promise<ReadableStream>;

interface ReadableStreamOptions {
  /** Custom identifier prefix */
  identifierPrefix?: string;
  /** Nonce for Content Security Policy */
  nonce?: string;
  /** Scripts to include in the HTML */
  bootstrapScripts?: Array<string>;
  /** Script content to include */
  bootstrapScriptContent?: string;
  /** Bootstrap modules */
  bootstrapModules?: Array<string>;
  /** Progressive chunk size */
  progressiveChunkSize?: number;
  /** AbortSignal for cancelling the stream */
  signal?: AbortSignal;
  /** Error callback */
  onError?: (error: mixed) => void;
}
```

**Usage Examples:**

```javascript
import { renderToReadableStream } from "react-dom/server.browser";

// Basic browser streaming
async function handleRequest(request) {
  const stream = await renderToReadableStream(<App />, {
    bootstrapScripts: ["/static/js/bundle.js"]
  });
  
  return new Response(stream, {
    headers: { "Content-Type": "text/html" }
  });
}

// With abort signal for timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const stream = await renderToReadableStream(<App />, {
    signal: controller.signal,
    onError(error) {
      console.error("Rendering error:", error);
    }
  });
  
  clearTimeout(timeoutId);
  return new Response(stream, {
    headers: { "Content-Type": "text/html" }
  });
} catch (error) {
  return new Response("Error", { status: 500 });
}
```

### Environment-Specific Behavior

#### Node.js Environment (`react-dom/server`)

All streaming and string rendering methods are available:

```javascript
import {
  renderToString,
  renderToStaticMarkup,
  renderToNodeStream,        // Available
  renderToStaticNodeStream,  // Available
  renderToPipeableStream
} from "react-dom/server";
```

#### Browser Environment (`react-dom/server.browser`)

Limited to string rendering and Web Streams:

```javascript
import {
  renderToString,
  renderToStaticMarkup,
  renderToNodeStream,        // Throws error
  renderToStaticNodeStream,  // Throws error
  renderToReadableStream     // Available (Web Streams)
} from "react-dom/server.browser";

// These will throw errors in browser environment
renderToNodeStream(<App />); // Error: Not supported in browser
renderToStaticNodeStream(<App />); // Error: Not supported in browser
```

## Integration Examples

### Express.js Integration

```javascript
import express from "express";
import { renderToPipeableStream } from "react-dom/server";

const app = express();

app.get("*", (req, res) => {
  const { pipe, abort } = renderToPipeableStream(<App url={req.url} />, {
    bootstrapScripts: ["/static/js/bundle.js"],
    onShellReady() {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      pipe(res);
    },
    onShellError(error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/html");
      res.send("<!doctype html><p>Loading...</p><script src=\"/static/js/bundle.js\"></script>");
    },
    onError(error) {
      console.error(error);
    }
  });
  
  setTimeout(abort, 10000);
});
```

### Next.js Style Streaming

```javascript
import { renderToPipeableStream } from "react-dom/server";

export async function renderPage(Component, props) {
  return new Promise((resolve, reject) => {
    let html = "";
    
    const { pipe } = renderToPipeableStream(<Component {...props} />, {
      onAllReady() {
        resolve(html);
      },
      onError(error) {
        reject(error);
      }
    });
    
    const writable = new WritableStream({
      write(chunk) {
        html += chunk;
      }
    });
    
    pipe(writable);
  });
}
```

## Version Information

```javascript { .api }
const version: string; // "18.3.1"
```