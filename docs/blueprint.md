# **App Name**: Dojo Dynamics

## Core Features:

- Secure Access: User authentication and role management (admin/client) with protected routes.
- Client Dashboard: Client dashboard to view personalized training plans.
- Admin Center: Admin dashboard for user management, template management, and system status monitoring.
- AI Plan Generation: Generate personalized training plans using AI. This feature takes into account the serverless function `generate-plan-from-ai` and the `OPENAI_API_KEY` secret to incorporate the external OpenAI API.
- System Monitor: Display system status information on a dedicated page for admins. Uses the `get-users` serverless function.
- Email Notifications: Send welcome and plan-ready emails to users using Resend, managed by serverless function `notify-client-plan-ready`.
- Invite Code: Generates invite codes that will be used by new users at registration time.

## Style Guidelines:

- Primary color: Saturated purple (#A050BE) for a sense of energy and determination. It is also reminiscent of royalty and dedication.
- Background color: Light grayish-purple (#F3F0F5) for a clean, modern backdrop.
- Accent color: Vivid blue (#50BEA0) to highlight key actions and elements.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text.
- Use sharp, minimalist icons to represent different actions and categories. All icons must be monochrome to match the minimalistic esthetic of the page.
- Modern, clean layout with clear separation of content sections.
- Subtle animations and transitions for a smooth user experience. Examples: fading transitions for dashboards and modals.