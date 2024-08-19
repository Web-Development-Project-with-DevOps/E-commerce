# E-commerce Website

This project is an e-commerce website built using FastAPI for the backend and MongoDB as the database. The frontend is developed using HTML, CSS, and JavaScript, with integration of Bootstrap for improved styling.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and login
- Product listing and search
- Add to cart functionality
- Checkout process
- Order history
- Responsive design using Bootstrap


## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Web-Development-Project-with-DevOps/E-commerce.git
    cd ecommerce
    ```

2. **Backend Setup:**

    - Navigate to the backend directory:
      ```bash
      cd Backend
      ```

    - Create a virtual environment and activate it:
      ```bash
      python -m venv venv
      source venv/bin/activate  # On Windows, use `.\venv\Scripts\activate`
      ```

    - Install the required packages:
      ```bash
      pip install -r requirements.txt
      ```

    - Ensure MongoDB is running on your system.

    - Run the FastAPI server:
      ```bash
      uvicorn main:app --reload
      ```

## Usage

- **Homepage:** Lists all available products and allows users to search for specific products.
- **Cart:** Users can add products to their cart, adjust quantities, and proceed to checkout.
- **Checkout:** Users can finalize their order
- **Orders:** Users can view their past orders.

## API Endpoints

### User Endpoints
- `POST /register`: Register a new user.
- `POST /login`: User login.

### Product Endpoints
- `GET /products`: Get all products.
- `POST /products`: Add a new product.

### Cart Endpoints
- `GET /cart`: Get cart items for a user.
- `POST /cart/add`: Add an item to the cart.
- `POST /cart/update`: Update the quantity of a cart item.
- `POST /cart/remove`: Remove an item from the cart.

### Order Endpoints
- `POST /checkout`: Checkout and create an order.
- `GET /orders`: Get all orders for a user.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


