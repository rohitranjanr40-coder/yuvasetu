# Firebase Studio

This is a Next.js starter project for Firebase Studio. This application is a modern video-sharing and streaming platform called "YuvaSetu".

## Getting Started

To get this project running on your local machine, follow these steps:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18 or later) and npm installed.

### Installation

1.  Open your terminal and navigate to the project's root directory.
2.  Install the necessary packages by running:
    ```bash
    npm install
    ```

### Seeding the Database

Before running the application, you need to populate the database with initial data (users, videos, etc.).

1.  Ensure you have a `.env` file with a valid `POSTGRES_URL`.
2.  Run the seed script:
    ```bash
    npm run db:seed
    ```
    This will clear existing data and insert the initial records from `src/lib/seed.js`.

### Running the Development Server

1.  After the installation and seeding are complete, start the local development server:
    ```bash
    npm run dev
    ```
2.  Open your web browser and go to [http://localhost:3000](http://localhost:3000) to see the application running.

Any changes you make to the code will automatically reload in the browser.
