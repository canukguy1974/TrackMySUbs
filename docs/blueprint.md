# **App Name**: SubScribe

## Core Features:

- Subscription Detection: AI-powered email scanning tool that identifies subscription confirmations and trial end notifications in multiple Gmail accounts. The AI is able to distinguish marketing emails from receipts and terms changes. The AI is a tool that reasons about the contents of your email and decides whether to include the email in its output.
- Multi-Account Support: Connect and manage multiple Gmail accounts to monitor subscriptions across all your email addresses.
- Subscription Dashboard: Display a clear, consolidated list of all detected subscriptions, including service name, billing date, payment method (card or free), trial end date (if applicable), and any associated actions (e.g., downgrade, renewal).
- SMS Reminders: Send SMS notifications 2 days before a trial ends or a payment is due, providing ample time to cancel or manage the subscription. Use a service with the best options for SMS.
- Notification Preferences: Allow users to manually adjust notification preferences for each subscription.
- Subscription Categorization and Filtering: Enable users to categorize their subscription such as, News, Entertainment, Music, Shopping and filter by them.
- Manual Subscription Input: Allow users to manually input subscription details for services not detected via email scanning. The app will store user details and subscription data in MongoDB.
- Monetization Support: Implement monetization strategies, allowing users to utilize provided API keys and hosting infrastructure for premium features and usage. Offer a free version (first scan free) and a paid subscription ($5/month).
- Authorization System: Implement a secure authorization system to manage user accounts and access to the application's features.

## Style Guidelines:

- Primary color: Shiny metallic blue, creating a modern and sleek aesthetic.
- Gradients: Implement blue to purple gradients for a visually appealing and modern interface.
- Body and headline font: 'Inter' (sans-serif), providing a clean and modern look, which can be implemented for both headers and body text.
- Use minimalist icons to represent subscription categories (e.g., music, news, entertainment).
- Implement a clean, card-based layout for the subscription dashboard.
- Subtle transitions and animations when switching between accounts or subscription details.