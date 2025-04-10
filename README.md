# NestJS CMS

A WordPress-like Content Management System built with NestJS and Handlebars.

## Features

- Blog posts management
- Static pages
- User authentication and authorization
- Media uploads
- Theme customization
- Admin panel

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nest-cms
```

2. Install dependencies:
```bash
npm install
```

3. Create a MySQL database:
```sql
CREATE DATABASE nest_cms;
```

4. Configure environment variables:
Create a `.env` file in the root directory and add the following:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=nest_cms
JWT_SECRET=your_jwt_secret
```

5. Run the application:
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The application will be available at `http://localhost:3000`

## Project Structure

```
nest-cms/
├── src/
│   ├── auth/           # Authentication module
│   ├── posts/          # Blog posts module
│   ├── pages/          # Static pages module
│   ├── users/          # User management module
│   ├── media/          # Media uploads module
│   ├── theme/          # Theme customization module
│   └── config/         # Configuration files
├── views/              # Handlebars templates
│   ├── layouts/        # Layout templates
│   ├── partials/       # Reusable template parts
│   └── pages/          # Page templates
└── public/             # Static files
    ├── css/           # Stylesheets
    ├── js/            # JavaScript files
    └── uploads/       # Uploaded media files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
