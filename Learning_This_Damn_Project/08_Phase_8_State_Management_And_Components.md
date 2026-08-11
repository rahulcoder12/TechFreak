# Phase 8: State Management and Components

In this phase, we'll dive into how we handle data fetching, caching, and state management, and look closely at the core reusable components of TechFreak.

## 1. State Management: The SWR Approach

### What is SWR and Why Use It?

SWR stands for **Stale-While-Revalidate**. It's a React Hooks library for data fetching created by Vercel.

**Why SWR over alternatives?**
- **Redux**: Redux is great for complex, deeply nested synchronous state. However, 90% of our "state" is just data from the server. Using Redux to cache server data requires tons of boilerplate (actions, reducers, thunks).
- **Context API**: Context is for passing props deeply, not for caching data. It lacks built-in caching, deduping, and background updates.
- **React Query**: Very similar to SWR. We chose SWR because it's slightly smaller and simpler for our specific needs, though React Query is an equally excellent choice.

### How Stale-While-Revalidate Works

When you request data using SWR:
1. It immediately returns the **stale** (cached) data if it exists (instant UI!).
2. It sends a fetch request to **revalidate** the data in the background.
3. It updates the UI with the fresh data if it changed.

### `swrhook.js` – Centralized Data Hooks

We define all our SWR hooks in one file. 

```javascript
import useSWR from 'swr';
import { sendRequestToBackend } from './utils';

// Our default fetcher uses our axios wrapper
const fetcher = url => sendRequestToBackend('get', url).then(res => res.data);

export const useUser = () => {
  const { data, error, mutate } = useSWR('/api/v1/users/me', fetcher);
  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
    mutate // We can call this to manually trigger a re-fetch!
  };
};
```

### The `authFetcher` Pattern

For endpoints like checking the current user (`/api/v1/users/me`), unauthenticated guests will get a 401 error. We don't want SWR throwing massive errors in the console or breaking the app for guests. We often use a custom fetcher that quietly catches 401s and returns null, cleanly indicating the user is a guest.

## 2. Key Components Deep Dive

### `Navbar.jsx`
- **Responsive**: Adapts from a horizontal bar to a hamburger menu with a sidebar on mobile.
- **Cart Badge**: Listens to the cart state to show the number of items.
- **Auth State**: Conditionally renders "Login" vs "Profile" based on the `useUser` hook.

### `ProductCard.jsx`
- This is a highly reusable component for displaying a product.
- Implements hover animations.
- Uses skeleton loading states (grey pulsing boxes) when data is still being fetched, providing a smooth UX rather than jarring layout shifts.

### `CardCart.jsx` and SWR Mutation
When you delete an item from the cart, we don't want to refresh the whole page.
1. We send a DELETE request to the server.
2. We call SWR's `mutate('/api/v1/cart')`.
3. SWR knows the cart endpoint is stale and automatically re-fetches the latest cart data, updating the UI instantly.

### Forms: `Form.jsx`, `Input.jsx`, `Button.jsx`
We don't write bare `<input>` tags. We use **Formik** and **Yup** for validation.
- **Formik** manages the form state (values, errors, touched fields) so we don't need dozens of `useState` hooks.
- **Yup** provides a schema for validation (e.g., `yup.string().email().required()`).
Our custom `Input.jsx` automatically hooks into Formik to display red error text if a Yup validation fails.

### `Recommendations.jsx`
This component hits our ML backend endpoints to fetch "Products you might like". It's a great example of an independent widget that uses SWR to fetch its own data regardless of where it's placed on the page.

## 3. Architecture Note: SWR vs Route Loaders

You might notice we use both React Router Loaders (from Phase 7) and SWR. Isn't this redundant? 

Sometimes, yes. 
- **Loaders** are perfect for critical data needed *before* rendering a page (like a blog post's content).
- **SWR** is perfect for dynamic data that updates frequently, needs background polling, or requires cache mutation (like a shopping cart or user profile).

In a massive refactor, a team might choose to use *only* React Router's advanced features, or *only* SWR/React Query. For TechFreak, mixing them shows we understand the strengths of both, though it can lead to some complexity in deciding *where* to fetch data.

---

## 🎧 Interview Prep

**Q: Why use SWR or React Query instead of Redux for state management?**
**A:** "Redux is excellent for complex client-side state. However, in most web apps, the majority of 'state' is just a cached copy of server data. Tools like SWR are purpose-built for this. They handle caching, background revalidation, loading states, and request deduplication out of the box. Building that functionality manually in Redux requires massive amounts of boilerplate code."

**Q: Explain the 'Stale-While-Revalidate' strategy.**
**A:** "It's a caching strategy where the system first returns the cached (stale) data immediately so the user sees the UI instantly. Then, in the background, it fires off a network request to revalidate that data. Once the fresh data arrives, it silently updates the UI. It provides the best of both worlds: the speed of caching and the accuracy of live data."

**Q: How do you handle form validation in React?**
**A:** "Managing form state manually with `useState` gets messy fast when you have many fields and validation rules. I prefer using a library like Formik to handle the form state, combined with Yup for schema-based validation. You define a Yup schema detailing exactly what a valid form looks like, and Formik automatically runs the inputs against that schema, giving you easy access to error messages to display in the UI."
