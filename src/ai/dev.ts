import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-subscription.ts';
import '@/ai/flows/detect-subscription-from-email.ts';