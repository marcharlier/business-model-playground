# Context System

React Context API types including createContext, useContext, and context provider/consumer patterns. Context provides a way to share data between components without explicitly passing props through every level of the component tree.

## Capabilities

### Context Creation and Types

Core types and functions for creating and using React Context.

```typescript { .api }
/**
 * Context object interface
 */
interface Context<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
  displayName?: string | undefined;
}

/**
 * Context provider component type
 */
interface Provider<T> {
  (props: ProviderProps<T>): ReactElement | null;
  propTypes?: never | undefined;
  contextType?: never | undefined;
  defaultProps?: never | undefined;
  displayName?: string | undefined;
}

/**
 * Provider component props
 */
interface ProviderProps<T> {
  value: T;
  children?: ReactNode | undefined;
}

/**
 * Context consumer component type
 */
interface Consumer<T> {
  (props: ConsumerProps<T>): ReactElement | null;
  propTypes?: never | undefined;
  contextType?: never | undefined;
  defaultProps?: never | undefined;
  displayName?: string | undefined;
}

/**
 * Consumer component props with render prop pattern
 */
interface ConsumerProps<T> {
  children: (value: T) => ReactNode;
}

/**
 * Extract the value type from a context
 */
type ContextType<C extends Context<any>> = C extends Context<infer T> ? T : never;
```

**Usage Examples:**

```typescript
import React, { Context, Provider, Consumer, ContextType } from "react";

// Define context value type
interface ThemeContextValue {
  theme: 'light' | 'dark';
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  toggleTheme: () => void;
}

// Create context with default value
const ThemeContext: Context<ThemeContextValue> = React.createContext<ThemeContextValue>({
  theme: 'light',
  colors: {
    primary: '#007bff',
    background: '#ffffff',
    text: '#000000'
  },
  toggleTheme: () => {}
});

// Extract type from context
type ExtractedThemeType = ContextType<typeof ThemeContext>; // ThemeContextValue

// Provider component example
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  
  const colors = theme === 'light' 
    ? { primary: '#007bff', background: '#ffffff', text: '#000000' }
    : { primary: '#ffc107', background: '#121212', text: '#ffffff' };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextValue = {
    theme,
    colors,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Consumer component example (render prop pattern)
const ThemeConsumer: React.FC = () => {
  return (
    <ThemeContext.Consumer>
      {(themeContext) => (
        <div 
          style={{ 
            backgroundColor: themeContext.colors.background,
            color: themeContext.colors.text,
            padding: '16px'
          }}
        >
          <p>Current theme: {themeContext.theme}</p>
          <button 
            onClick={themeContext.toggleTheme}
            style={{ backgroundColor: themeContext.colors.primary }}
          >
            Toggle Theme
          </button>
        </div>
      )}
    </ThemeContext.Consumer>
  );
};
```

### createContext Function

Creates a new Context object with proper type inference.

```typescript { .api }
/**
 * Creates a context object with the given default value
 */
function createContext<T>(defaultValue: T): Context<T>;

/**
 * Creates a context without default value (for cases where context is always provided)
 */
function createContext<T = undefined>(): Context<T | undefined>;
```

**Usage Examples:**

```typescript
import React, { createContext, useState } from "react";

// User context with full type safety
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

interface UserContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Context with default value
const UserContext = createContext<UserContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

// App settings context
interface AppSettings {
  language: string;
  timezone: string;
  notifications: boolean;
  autoSave: boolean;
}

interface AppSettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  language: 'en',
  timezone: 'UTC',
  notifications: true,
  autoSave: true
};

const AppSettingsContext = createContext<AppSettingsContextValue>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {}
});

// API context (no default value - must be provided)
interface ApiContextValue {
  apiKey: string;
  baseUrl: string;
  fetch: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

// Provider implementations
const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Load user from localStorage on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }
  }, []);

  const value: UserContextValue = {
    user,
    login,
    logout,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const value: AppSettingsContextValue = {
    settings,
    updateSettings,
    resetSettings
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};

const ApiProvider: React.FC<{ 
  children: React.ReactNode; 
  apiKey: string; 
  baseUrl: string; 
}> = ({ children, apiKey, baseUrl }) => {
  
  const apiCall = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  const value: ApiContextValue = {
    apiKey,
    baseUrl,
    fetch: apiCall
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};
```

### useContext Hook

Hook for consuming context values with full type safety.

```typescript { .api }
/**
 * Hook to consume context values
 */
function useContext<T>(context: Context<T>): T;
```

**Usage Examples:**

```typescript
import React, { useContext } from "react";

// Custom hooks for context consumption
const useUser = () => {
  const context = useContext(UserContext);
  return context;
};

const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  return context;
};

const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Components using context
const UserProfile: React.FC = () => {
  const { user, updateUser, logout } = useUser();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  if (!user) {
    return <div>Please log in</div>;
  }

  const handleSave = () => {
    updateUser({ name });
    setEditing(false);
  };

  const handleCancel = () => {
    setName(user.name);
    setEditing(false);
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>User Profile</h3>
      
      {editing ? (
        <div>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button onClick={() => setEditing(true)}>Edit Name</button>
        </div>
      )}
      
      <button onClick={logout} style={{ marginTop: '8px' }}>
        Logout
      </button>
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useAppSettings();

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Settings</h3>
      
      <div style={{ marginBottom: '8px' }}>
        <label>
          Language: 
          <select 
            value={settings.language} 
            onChange={(e) => updateSettings({ language: e.target.value })}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </label>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={settings.notifications}
            onChange={(e) => updateSettings({ notifications: e.target.checked })}
          />
          Enable notifications
        </label>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={settings.autoSave}
            onChange={(e) => updateSettings({ autoSave: e.target.checked })}
          />
          Auto-save
        </label>
      </div>
      
      <button onClick={resetSettings}>Reset to Defaults</button>
    </div>
  );
};

const DataFetcher: React.FC<{ endpoint: string }> = ({ endpoint }) => {
  const api = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.fetch(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [endpoint]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h4>Data from {endpoint}:</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={fetchData}>Refresh</button>
    </div>
  );
};

// Main app component
const ContextExample: React.FC = () => {
  return (
    <UserProvider>
      <AppSettingsProvider>
        <ApiProvider apiKey="your-api-key" baseUrl="https://api.example.com">
          <div style={{ padding: '16px' }}>
            <h2>Context System Example</h2>
            
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <UserProfile />
              <SettingsPanel />
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <DataFetcher endpoint="/users" />
            </div>
          </div>
        </ApiProvider>
      </AppSettingsProvider>
    </UserProvider>
  );
};
```

### Class Component Context Usage

Using context in class components with contextType and Consumer patterns.

```typescript { .api }
/**
 * Static contextType property for class components
 */
interface Component<P, S> {
  static contextType?: Context<any> | undefined;
  context: any;
}
```

**Usage Examples:**

```typescript
import React, { Component } from "react";

// Class component using contextType
class UserDashboard extends Component<{}, { loading: boolean }> {
  static contextType = UserContext;
  declare context: React.ContextType<typeof UserContext>;

  constructor(props: {}) {
    super(props);
    this.state = { loading: false };
  }

  componentDidMount() {
    // Access context in lifecycle methods
    if (this.context.user) {
      console.log('User logged in:', this.context.user.name);
    }
  }

  componentDidUpdate(prevProps: {}, prevState: { loading: boolean }) {
    // React to context changes
    if (this.context.user !== (this as any).prevUser) {
      console.log('User context changed');
      (this as any).prevUser = this.context.user;
    }
  }

  handleRefresh = async () => {
    if (!this.context.user) return;

    this.setState({ loading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.setState({ loading: false });
  };

  render() {
    const { user, logout } = this.context;
    const { loading } = this.state;

    if (!user) {
      return <div>Please log in to access dashboard</div>;
    }

    return (
      <div style={{ padding: '16px' }}>
        <h2>Dashboard for {user.name}</h2>
        <p>Role: {user.role}</p>
        
        <button 
          onClick={this.handleRefresh} 
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
        
        <button onClick={logout}>Logout</button>
      </div>
    );
  }
}

// Class component using multiple contexts with Consumer
class MultiContextComponent extends Component {
  render() {
    return (
      <UserContext.Consumer>
        {(userContext) => (
          <AppSettingsContext.Consumer>
            {(settingsContext) => (
              <div style={{ padding: '16px' }}>
                <h3>Multi-Context Component</h3>
                
                <p>User: {userContext.user?.name || 'Not logged in'}</p>
                <p>Language: {settingsContext.settings.language}</p>
                <p>Notifications: {settingsContext.settings.notifications ? 'On' : 'Off'}</p>
                
                <button 
                  onClick={() => settingsContext.updateSettings({ 
                    notifications: !settingsContext.settings.notifications 
                  })}
                >
                  Toggle Notifications
                </button>
              </div>
            )}
          </AppSettingsContext.Consumer>
        )}
      </UserContext.Consumer>
    );
  }
}
```

### Advanced Context Patterns

Complex patterns and optimization techniques for context usage.

```typescript { .api }
/**
 * Context with multiple providers pattern
 */
interface CompositeContextValue<T extends Record<string, any>> {
  [K in keyof T]: T[K];
}

/**
 * Context selector pattern for performance
 */
type ContextSelector<T, R> = (contextValue: T) => R;
```

**Usage Examples:**

```typescript
import React, { createContext, useContext, useMemo, useCallback } from "react";

// Optimized context with selectors
interface AppState {
  user: User | null;
  settings: AppSettings;
  notifications: Array<{ id: string; message: string; type: 'info' | 'warning' | 'error' }>;
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    loading: boolean;
  };
}

interface AppActions {
  setUser: (user: User | null) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

type AppContextValue = AppState & AppActions;

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Custom hook with selector pattern
function useAppContext(): AppContextValue;
function useAppContext<T>(selector: ContextSelector<AppContextValue, T>): T;
function useAppContext<T>(selector?: ContextSelector<AppContextValue, T>) {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  
  if (selector) {
    // Memoize selected value to prevent unnecessary re-renders
    return useMemo(() => selector(context), [selector, context]);
  }
  
  return context;
}

// Specific selector hooks for performance
const useUser = () => useAppContext(ctx => ctx.user);
const useSettings = () => useAppContext(ctx => ctx.settings);
const useNotifications = () => useAppContext(ctx => ctx.notifications);
const useUI = () => useAppContext(ctx => ctx.ui);

// Provider with optimized re-rendering
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    settings: defaultSettings,
    notifications: [],
    ui: {
      sidebarOpen: false,
      theme: 'light',
      loading: false
    }
  });

  // Memoized actions to prevent recreation on every render
  const actions = useMemo<AppActions>(() => ({
    setUser: (user) => setState(prev => ({ ...prev, user })),
    
    updateSettings: (updates) => setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    })),
    
    addNotification: (notification) => setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { ...notification, id: Date.now().toString() }]
    })),
    
    removeNotification: (id) => setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    })),
    
    toggleSidebar: () => setState(prev => ({
      ...prev,
      ui: { ...prev.ui, sidebarOpen: !prev.ui.sidebarOpen }
    })),
    
    setTheme: (theme) => setState(prev => ({
      ...prev,
      ui: { ...prev.ui, theme }
    })),
    
    setLoading: (loading) => setState(prev => ({
      ...prev,
      ui: { ...prev.ui, loading }
    }))
  }), []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AppContextValue>(() => ({
    ...state,
    ...actions
  }), [state, actions]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Components using optimized context
const UserHeader: React.FC = React.memo(() => {
  const user = useUser(); // Only re-renders when user changes
  const { setUser } = useAppContext(ctx => ({ setUser: ctx.setUser }));

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
      <span>Welcome, {user.name}</span>
      <button onClick={() => setUser(null)}>Logout</button>
    </div>
  );
});

const NotificationsList: React.FC = React.memo(() => {
  const notifications = useNotifications(); // Only re-renders when notifications change
  const { removeNotification } = useAppContext(ctx => ({ 
    removeNotification: ctx.removeNotification 
  }));

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            padding: '8px 12px',
            margin: '4px 0',
            backgroundColor: notification.type === 'error' ? '#fee' : 
                           notification.type === 'warning' ? '#ffeaa7' : '#e8f4fd',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          {notification.message}
          <button 
            onClick={() => removeNotification(notification.id)}
            style={{ marginLeft: '8px' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
});

const Sidebar: React.FC = React.memo(() => {
  const ui = useUI(); // Only re-renders when UI state changes
  const { toggleSidebar } = useAppContext(ctx => ({ toggleSidebar: ctx.toggleSidebar }));

  if (!ui.sidebarOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '250px',
      height: '100vh',
      backgroundColor: ui.theme === 'dark' ? '#333' : '#f8f9fa',
      color: ui.theme === 'dark' ? 'white' : 'black',
      padding: '16px',
      borderRight: '1px solid #ccc'
    }}>
      <button onClick={toggleSidebar}>Close Sidebar</button>
      <nav>
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#profile">Profile</a></li>
          <li><a href="#settings">Settings</a></li>
        </ul>
      </nav>
    </div>
  );
});

// Main app using optimized context
const OptimizedContextExample: React.FC = () => {
  return (
    <AppProvider>
      <div>
        <UserHeader />
        <Sidebar />
        <NotificationsList />
        
        <main style={{ padding: '16px' }}>
          <h1>Optimized Context App</h1>
          <p>Components only re-render when their specific context slice changes.</p>
        </main>
      </div>
    </AppProvider>
  );
};
```

## Types

### Context Type Definitions

```typescript { .api }
// Core context interfaces
interface Context<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
  displayName?: string | undefined;
}

interface Provider<T> {
  (props: ProviderProps<T>): ReactElement | null;
  propTypes?: never | undefined;
  contextType?: never | undefined;
  defaultProps?: never | undefined;
  displayName?: string | undefined;
}

interface ProviderProps<T> {
  value: T;
  children?: ReactNode | undefined;
}

interface Consumer<T> {
  (props: ConsumerProps<T>): ReactElement | null;
  propTypes?: never | undefined;
  contextType?: never | undefined;  
  defaultProps?: never | undefined;
  displayName?: string | undefined;
}

interface ConsumerProps<T> {
  children: (value: T) => ReactNode;
}

// Utility types
type ContextType<C extends Context<any>> = C extends Context<infer T> ? T : never;

// Class component context
interface ComponentClass<P = {}, S = ComponentState> {
  contextType?: Context<any> | undefined;
}

interface Component<P = {}, S = {}, SS = any> {
  context: any;
}
```