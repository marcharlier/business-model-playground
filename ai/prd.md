# App name
Business model playground

# Purpose of the app
The app lets users build a business model by adding fixed costs, products and services with associated costs and then see a dashboard results page showing whether the business is profitable or not and what revnues and costs would look like. This results dashboard has controls for the products and services to quickly change the number of sales made per month and the prices so that the user can see the effect of those decisions.

# Functionality
The app lets users do this for multiple separate projects and come back to them later or switch between them. Each project has an overall currency setting that changes the way all financial values are displayed. The default currency is GBP and others on offer are USD and EUR.

The UI for adding fixed costs is a nicely designed minimal UI that has multiple categories of costs, each with some helper text to help jog the users memory of what type of costs they might want to consider. In each category bucket there is an "add" button to quickly add a cost for this category with a name and value. Costs can be set to be "monthly" or "annual" and this is accounted for accordingly in the results dashboard.

The UI for adding products or services has an easy to use form that lets the user give the product or service a name and cost, and then also add associated costs to this item such as material costs or sub-contractor costs. When a product is created it is added to a list and the user can add more. There is an option to "duplicate" an existing product to make it faster to create similar products with slight variations. Each product or service has a nice UI component that shows their specific profit margin based on the price and costs.

Overall the app has a very minimal and sleek UI, it uses something like Shadcn with styling choices like the default examples on the Shadcn website.

The results dashboard becomes visible as soon as a single fixed cost or product is added. Before that it has an empty state that drives the user to adding some costs or products. It works on a "monthly" basis. The dashboard uses nice and easy to read components for total monthly revenue, total monthly costs, monthly profit/loss and monthly profit margin. There are easy to use controls to play around with number of monthly sales and the price of the products and services defined. This updates the dashboard in real time. There are also components to display the revenue breakdown across the products and services and a pie chart showing the overall cost of the business between fixed and variable costs.

On first launch, there is a simple create form to create the first project using name and currency.

Projects can be renamed and the currency changed at any time without breaking any of the data.

User accounts, authentication and storage are all aspects that can come in the future - initially it can be an unauthenticated app that uses localstorage to test the UI and functionality, but it should be easy to migrate this to use a db and have some authentication later on.

# Suggested technology
I want to use a simple to understand tech stack and am open to suggestions. This app should be capable to be hosted on something like Vercel in the future.

UI Suggestion: Shadcn UI

# Specific code instructions
- The storage model used throughout the app should work like the example provided in storage-example.json
- Param properties should never be accessed directly (like `params.id`) and instead, `params` should be dealt with as a Promise and unwrapped with `React.use()`