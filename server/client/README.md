# E-Shop - Ecommerce Project

Ek full - stack ecommerce web app jisme products browse, cart, aur user login system hai.

## Features

- Product listing with search and filters
- Category wise products
- Add/Edit/Delete
- Shopping cart
- User register aur login system
- JWT token based authentication

# Tech Stack

| Part | Technology |
| Frontend | HTML, CSS, Vanilla JS
| Backend | Node.js, Fastify |
| Database | SQLite (better-sqlite3)
| Auth | bcryptjs, JWT |
| API Docs | Swagger UI |

## File Structure

```

```

## Getting Started

### Setup — Kaise chalayein?

Server start karo

```
npm run dev
```

### Frontend open karo

- VS Code mein `client/index.html` pe right-click karo
- **Open with Live Server** click karo

---

## API Endpoints

### Auth

| Method | URL                  | Kaam               |
| ------ | -------------------- | ------------------ |
| POST   | `/api/auth/register` | Naya account banao |
| POST   | `/api/auth/login`    | Login karo         |

### Products

| Method | URL             | Kaam                |
| ------ | --------------- | ------------------- |
| GET    | `/products`     | Sab products lo     |
| GET    | `/products/:id` | Ek product lo       |
| POST   | `/products`     | Product banao       |
| PATCH  | `/products/:id` | Product update karo |
| DELETE | `/products/:id` | Product delete karo |

## Author

**Shruti Prajapati**
