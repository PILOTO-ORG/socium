# socium

## Project Overview
Socium is a platform designed for analyzing leads using artificial intelligence. The application consists of a frontend built with React and TypeScript, a backend developed in Node.js and TypeScript, and utilizes a PostgreSQL database for storing messages imported from CSV files.

## Features
- **Lead Analysis**: Utilize AI to analyze leads and provide insights.
- **Dashboard**: Visualize key statistics and metrics related to leads.
- **CSV Ingestion**: Import messages from CSV files into the database for analysis.
- **API Integration**: Communicate between the frontend and backend seamlessly.

## Project Structure
The project is organized into the following main directories:

- **frontend**: Contains the React application.
  - **src**: Source files for the frontend application.
  - **public**: Static files, including the main HTML template.
  - **package.json**: Frontend dependencies and scripts.
  - **tsconfig.json**: TypeScript configuration for the frontend.

- **backend**: Contains the Node.js application.
  - **src**: Source files for the backend application.
  - **package.json**: Backend dependencies and scripts.
  - **tsconfig.json**: TypeScript configuration for the backend.

- **database**: SQL files for database schema and seeding.
- **docker-compose.yml**: Configuration for running the application with Docker.
- **README.md**: Documentation for the project.

## Setup Instructions
1. Clone the repository.
2. Navigate to the `frontend` directory and run `npm install` to install frontend dependencies.
3. Navigate to the `backend` directory and run `npm install` to install backend dependencies.
4. Set up the PostgreSQL database and run the SQL scripts in the `database` directory to initialize the schema and seed data.
5. Use `docker-compose up` to start the application services.

## Usage
- Access the frontend application in your web browser.
- Use the dashboard to view lead analytics and insights.
- Import messages via the backend API for analysis.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.