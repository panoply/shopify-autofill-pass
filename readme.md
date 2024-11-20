# Shopify Autofill Pass

A Chrome extension that will automatically login to development stores using a query parameter.

### Why?

Shopify decided to password prompt development stores which is a real headache. The community has asked for this to be refactored but here we are.

# Usage

Simply provide the store password via query parameter. The extension supports either `?password=` or simply `?p=` params. The login prompt will be automatically filled and access to the preview store granted.

**Example URLs**

```
https://store.myshopify.com?password=foo
https://store.myshopify.com?p=foo
https://store.myshopify.com?preview_theme_id=123456789&password=foo
https://store.myshopify.com?preview_theme_id=123456789&p=foo
```

> This extension is designed to work with development stores, typically created with partner accounts.

# Author

Follow me on [X](https://x.com/niksavvidis)