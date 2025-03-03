# Setting Up the Poll Management System

This guide provides step-by-step instructions for setting up and running the Poll Management System locally.

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open in browser
open http://localhost:5173
```

## Detailed Setup Instructions

### 1. System Requirements

- **Node.js**: Version 14 or higher
  ```bash
  # Check Node.js version
  node --version
  ```
- **Package Manager**: npm (comes with Node.js) or yarn
  ```bash
  # Install yarn globally (if needed)
  npm install -g yarn
  ```

### 2. Project Setup

1. **Install Dependencies**
   ```bash
   # Using yarn (recommended)
   yarn install

   # Using npm
   npm install
   ```

2. **Verify Installation**
   - Check if all dependencies are installed correctly in `node_modules`
   - Ensure no major errors in the installation logs

### 3. Configuration

1. **API Setup**
   - Open `src/ApolloClient.ts`
   - Verify the GraphQL API endpoint is correctly configured
   - Default endpoint should work out of the box

2. **Environment Variables** (if needed)
   - Create `.env` file in root directory
   - Copy required variables from `.env.example`
   - Fill in necessary values

### 4. Running the Application

1. **Development Mode**
   ```bash
   # Start development server with yarn
   yarn dev

   # Or with npm
   npm run dev
   ```

2. **Production Build**
   ```bash
   # Create production build
   yarn build

   # Preview production build
   yarn preview
   ```

3. **Linting**
   ```bash
   # Run ESLint
   yarn lint
   ```

### 5. Accessing the Application

1. Once the development server starts, access the application at:
   - [http://localhost:5173](http://localhost:5173)

2. Default ports:
   - Development: 5173
   - Preview: 4173

### 6. Common Issues & Solutions

1. **Port Already in Use**
   ```bash
   # Find process using port 5173
   lsof -i :5173

   # Kill process
   kill -9 <PID>
   ```

2. **Dependency Issues**
   ```bash
   # Clear cache and reinstall
   yarn cache clean
   rm -rf node_modules
   yarn install
   ```

3. **Build Errors**
   ```bash
   # Clean and rebuild
   rm -rf dist
   yarn build
   ```

### 7. Development Tools

1. **Browser DevTools**
   - React Developer Tools
   - Apollo Client DevTools
   - Redux DevTools

2. **VS Code Extensions**
   - ESLint
   - Prettier
   - TypeScript
   - Material-UI Snippets

### 8. Testing the Setup

1. **Verify Features**
   - Switch between User/Admin modes
   - Create a test question
   - Submit a test response
   - Toggle dark/light mode

2. **Check Performance**
   - Application loads without errors
   - Smooth transitions
   - Real-time updates working

### 9. Getting Help

If you encounter issues:
1. Check the console for error messages
2. Review the troubleshooting section
3. Clear browser cache and reload
4. Verify all prerequisites are met

### 10. Next Steps

After successful setup:
1. Review the main README for feature documentation
2. Explore the codebase structure
3. Try creating and answering questions
4. Test both User and Admin functionalities 