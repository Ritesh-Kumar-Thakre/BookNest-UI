# 🎨 BookNest Frontend - Modern Angular Application

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21.0.0-dd0031.svg" alt="Angular">
  <img src="https://img.shields.io/badge/RxJS-7.8.0-b7178c.svg" alt="RxJS">
  <img src="https://img.shields.io/badge/CSS3-Modern-1572B6.svg" alt="CSS3">
  <img src="https://img.shields.io/badge/HTML5-Semantic-E34F26.svg" alt="HTML5">
  <img src="https://img.shields.io/badge/UX-Premium-blueviolet.svg" alt="UX">
</p>

The **BookNest Frontend** is a state-of-the-art web application built with Angular. It provides a seamless, high-performance user interface for the BookNest ecosystem, connecting users with their favorite books through an intuitive and responsive design.

---

## ✨ Key Features

- 🏠 **Dynamic Home Page**: Featured books, carousels, and personalized recommendations.
- 🔍 **Advanced Search & Filter**: Real-time book discovery with category and price filtering.
- 🛒 **Smart Cart & Checkout**: Integrated shopping experience with real-time stock validation.
- 👤 **User Profiles**: Comprehensive profile management including order history and wishlists.
- 💰 **Digital Wallet**: Secure wallet management for seamless transactions.
- 🛡️ **Admin & Seller Dashboards**: Specialized tools for inventory management, user moderation, and sales tracking.
- 🔔 **Notification Center**: Real-time alerts for order updates and system announcements.

---

## 🛠️ Project Structure

The application follows a modular architecture for better maintainability and scalability.

```mermaid
graph TD
    App[App Component] --> Core[Core Module]
    App --> Pages[Pages Module]
    App --> Shared[Shared Module]

    subgraph "Core"
        Core --> Auth[Auth Service]
        Core --> Guards[Route Guards]
        Core --> Interceptors[HTTP Interceptors]
    end

    subgraph "Pages"
        Pages --> Catalog[Catalog/Search]
        Pages --> BookDetails[Book Details]
        Pages --> User[User/Profile/Wallet]
        Pages --> Dashboards[Admin/Seller]
    end

    subgraph "Shared"
        Shared --> Navbar[Navigation Bar]
        Shared --> Footer[Site Footer]
        Shared --> UI[Toast/Spinners/Modals]
    end
```

---

## 🚀 Technologies

| Technology | Purpose |
| :--- | :--- |
| **Angular** | Core framework for building the SPA. |
| **RxJS** | Reactive programming and state management. |
| **Vanilla CSS** | Custom, high-performance styling without heavy frameworks. |
| **Lucide Icons** | Modern and clean iconography. |
| **Angular Router** | Client-side navigation and lazy loading. |
| **Signals** | Modern Angular state reactivity. |

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.dev/tools/cli)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/booknest.git
   cd booknest/Frontend/BookNest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Endpoints:**
   - Open `src/environments/environment.ts` (or relevant config file).
   - Ensure the API Gateway URL points to `http://localhost:8080/api/v1`.

4. **Run the application:**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/` in your browser.

---

## 📸 Application Preview

| Home Page | Catalog | Book Detail |
| :---: | :---: | :---: |
| 🏠 | 📚 | 📖 |
| *Stunning Hero Section* | *Grid/List Views* | *Rich Descriptions* |

---

## 🛡️ Role-Based Access

The frontend dynamically adjusts based on the user's role:
- **USER**: Can browse, purchase, and review books.
- **SELLER**: Can list new books and manage their inventory.
- **ADMIN**: Full system control, user management, and global book verification.

---

<p align="center">
  Designed with ✨ by the BookNest Frontend Team
</p>
