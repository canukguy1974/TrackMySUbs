# Taking Your SubScribe App to Production

Fantastic! This guide will walk you through the essential steps to deploy your SubScribe application and make it available to real users. We'll cover everything from setting up your services to deploying the code.

## Step 1: Set Up Your Services and Get API Keys

Your app connects to several external services. You'll need to create an account for each one and gather the required API keys.

### 1.1. Firebase Project
*   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
*   **Enable Firebase Authentication**: In your new project, go to the "Authentication" section, click "Get Started," and enable the **Google** sign-in provider.
*   **Get Web App Credentials**: Go to Project Settings (click the gear icon) -> General. Under "Your apps," click the Web icon (`</>`) to register a new web app. Firebase will give you a `firebaseConfig` object. Copy these values into your `.env` file for the `NEXT_PUBLIC_FIREBASE_*` variables.
*   **Get Server-side Credentials (Service Account)**:
    1.  In Project Settings, go to the "Service Accounts" tab.
    2.  Click "Generate new private key" and confirm. A JSON file will be downloaded.
    3.  **Do not** put this file in your project. Instead, you need to convert its content to a single-line Base64 string. You can use an online tool or run this command in your terminal:
        ```bash
        # For macOS/Linux. On Windows, you might need a tool like Git Bash.
        cat /path/to/your/serviceAccountKey.json | base64
        ```
    4.  Copy the entire long string that is output. This is your `FIREBASE_SERVICE_ACCOUNT_BASE64` value.

### 1.2. MongoDB Database
*   Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account and cluster.
*   **Create a Database and Collection**: Create a database (e.g., `subscribe_db`) and two collections: `users` and `subscriptions`.
*   **Get Connection String**: In your Atlas dashboard, click "Connect," choose "Drivers," and copy the connection string (URI).
*   **Whitelist IP Address**: For Atlas to accept connections, you must add your IP address to the IP Access List. For deployment, you should add `0.0.0.0/0` (Allow Access from Anywhere) to let your hosting provider connect.
*   **Create a Database User**: You'll also need to create a database user and password.
*   Replace `<username>`, `<password>`, and other placeholders in the connection string with your actual credentials. This is your `MONGODB_URI`.

### 1.3. Twilio for SMS
*   Sign up for a [Twilio](https://www.twilio.com/try-twilio) account.
*   **Get a Phone Number**: From your Twilio console, get a phone number with SMS capabilities. This is your `TWILIO_PHONE_NUMBER`.
*   **Find Your Credentials**: On the main dashboard of your Twilio console, you'll find your `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.

### 1.4. Google AI for Genkit
*   Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create an API key. This is your `GOOGLE_API_KEY`.

## Step 2: Configure Environment Variables

Create a file named `.env` in the root of your project (you can copy `env.example`). Paste all the keys you collected in Step 1 into this file. This file is already in `.gitignore`, so your keys will remain private.

## Step 3: Deploying with Firebase App Hosting

Firebase App Hosting is the easiest and most integrated way to deploy this app.

1.  **Install Firebase CLI**: If you don't have it, install the command-line tool:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login to Firebase**:
    ```bash
    firebase login
    ```
3.  **Initialize App Hosting**: In your project's root directory, run:
    ```bash
    firebase init apphosting
    ```
    Follow the prompts. Select the Firebase project you created in Step 1.
4.  **Add Secrets to App Hosting**: Your production app needs the same environment variables. **Do not** commit your `.env` file. Instead, add them as secrets to your App Hosting backend in the [Firebase Console](https://console.firebase.google.com/) or by running the following command for each variable:
    ```bash
    firebase apphosting:secrets:set YOUR_VARIABLE_NAME
    # It will prompt you for the secret value.
    # Example: firebase apphosting:secrets:set MONGODB_URI
    ```
    Repeat this for all the variables in your `env.example` file.
5.  **Deploy!**:
    ```bash
    firebase deploy
    ```
    After it finishes, the CLI will give you the URL to your live application!

## Step 4: Integrating Payments (e.g., Stripe)

The app is "paywall-ready," but it doesn't process payments yet. Here's a high-level guide to adding Stripe:

1.  **Stripe Setup**: Create a [Stripe account](https://stripe.com) and find your API keys. Add them as secrets to your deployed app.
2.  **Create a Product**: In the Stripe dashboard, create a "Product" for your "Premium Plan." Add a recurring price to it (e.g., $5/month).
3.  **Create Checkout Session**: Modify the `handleUpgrade` function in `src/app/billing/page.tsx`. This should now be a Server Action that calls the Stripe API to create a "Checkout Session."
4.  **Redirect to Checkout**: The Server Action should return the URL for the Stripe Checkout page, and your client-side code will redirect the user there to pay.
5.  **Listen for Success with a Webhook**:
    *   Create a new API route or Server Action in your app to act as a Stripe webhook handler.
    *   In the Stripe dashboard, configure a webhook to send the `checkout.session.completed` event to your handler's URL.
    *   When your handler receives this event, it should securely verify the request came from Stripe, then update the user's `isPremium` field in your MongoDB database to `true`.

And that's it! Following these steps will take your application from a local prototype to a fully functional, live service ready for users.
