'use server';

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// Define user schema
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  state: z.string(),
  password: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// Define input/output schemas
const LoginInputSchema = z.object({ email: z.string().email(), password: z.string() });
const LoginOutputSchema = z.object({
  success: z.boolean(),
  user: UserSchema.omit({ password: true }).optional(),
  message: z.string(),
});

const SignupInputSchema = UserSchema;
const SignupOutputSchema = z.object({
  success: z.boolean(),
  user: UserSchema.omit({ password: true }).optional(),
  message: z.string(),
});

// --- In-memory user store (demo only) ---
const users: User[] = [];

// --- Genkit Flows ---
// Login flow: anyone can log in if they enter an email
export const loginUser = ai.defineFlow(
  {
    name: 'loginUserFlow',
    inputSchema: LoginInputSchema,
    outputSchema: LoginOutputSchema,
  },
  async ({ email, password }) => {
    // Just return a user object without checking password
    const user = { email, name: 'Demo User', state: 'Demo State' };
    return { success: true, user, message: 'Login successful (no auth check).' };
  }
);

// Signup flow: just return the user, no file write
export const signupUser = ai.defineFlow(
  {
    name: 'signupUserFlow',
    inputSchema: SignupInputSchema,
    outputSchema: SignupOutputSchema,
  },
  async (newUser) => {
    // Add to in-memory array (optional)
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword, message: 'Signup successful (demo).' };
  }
);
