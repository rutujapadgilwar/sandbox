# Poll Management System

A modern web application for managing polls and questions, built with React, TypeScript, Material-UI, and Apollo Client.

## Features

- Create, edit, and delete questions (Admin mode)
- Support for Multiple Choice (MC) and Open Ended (OE) questions
- Answer questions and view responses (User mode)
- Dark/Light mode support
- Role-based access control (Admin/User modes)
- Real-time updates with Apollo Client caching
- Responsive design with Material-UI components

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sandbox
```

2. Install dependencies:
```bash
# Using npm
npm install

# Using yarn
yarn install
```

## Running the Application

1. Start the development server:
```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

## Available Scripts

- `yarn dev` or `npm run dev`: Starts the development server
- `yarn build` or `npm run build`: Builds the app for production
- `yarn preview` or `npm run preview`: Previews the production build locally
- `yarn lint` or `npm run lint`: Runs the linter

## Environment Setup

The application uses Apollo Client to connect to a GraphQL API. Make sure your API endpoint is properly configured in `src/ApolloClient.ts`.

## Usage

1. **Switching Modes**:
   - Use the toggle buttons at the top of the questions table to switch between User and Admin modes
   - Admin mode allows creating, editing, and deleting questions
   - User mode allows answering questions and viewing responses

2. **Dark/Light Mode**:
   - Click the sun/moon icon to toggle between dark and light themes

3. **Managing Questions (Admin Mode)**:
   - Click the "+" button to create a new question
   - Use the edit icon to modify existing questions
   - Use the delete icon to remove questions
   - For MC questions, you can add/remove choices

4. **Answering Questions (User Mode)**:
   - Click the answer icon to respond to a question
   - For MC questions, select from available choices
   - For OE questions, enter text (minimum 2 characters)

5. **Viewing Details**:
   - Click the info icon to view question details
   - See all responses and choices (for MC questions)
   - Both users and admins can delete responses

## Dependencies

- React 18
- TypeScript
- Material-UI v6
- Apollo Client
- GraphQL
- Redux Toolkit
- Material-UI Confirm

## Development

The project uses:
- Vite as the build tool
- ESLint for code linting
- TypeScript for type safety
- SWC for fast compilation

## Troubleshooting

1. If you encounter installation issues:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

2. If the development server fails to start:
   - Check if port 5173 is available
   - Ensure all dependencies are properly installed
   - Verify the API endpoint configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request