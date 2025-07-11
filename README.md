<div align="center">
	<img src=".media/hero.png" alt="surrealdbug">
</div>

# SurrealDBug
An embeddable widget containing a suite of tools for debugging frontend applications that use [SurrealDB](https://surrealdb.com).

## Features
- Directly execute queries on behalf of your Surreal instance.
- View a history of all executed queries and their responses.
- Embed directly into any frontend application, regardless of framework.
- Private by design. The entire source is bundled within the package, so your queries are never exposed to the public internet.

## Usage
**NOTE**: Your app must be using the `surrealdb` JavaScript SDK

1. Install the package:
```
npm install surrealdbug
```

2. Import styles:
```typescript
import "surrealdbug/styles.css";
```

3. Initialize with your connected Surreal instance:
```typescript
import surrealdbug from "surrealdbug";

const surreal = new Surreal();

surreal.connect().then(() => {
    surrealdbug(surreal);
});
```

4. Trigger the UI using ctrl/cmd + k.

## Configuration
Optional configuration can be passed to the main `surrealdbug` function:

```typescript
surrealdbug(surreal, {

    // The element in which the app should render.
    // Default is document.body.
    container: document.querySelector("#my-surrealdbug-container"),

    // The key (in combination with ctrl/cmd) used to trigger the UI.
    // Default is 'k'.
    key: "j"
});
```

For even further customization, the `surrealdbug` function returns the iframe it created:
```typescript
const { frame } = surrealdbug(surreal);

frame.className = "my-surrealdbug-class";
```

## React Example
Although SurrealDBug is designed to work with any frontend application, below is an example of how to use it within a React app:

```typescript
import "surrealdbug/styles.css";
import surrealdbug from "surrealdbug";

export function App() {
    const surreal = useRef(new Surreal());

    useEffect(() => {
        surreal.current.connect()
            .then(() => {
                surrealdbug(surreal.current);
            });
    }, []);

    return <></>;
};
```