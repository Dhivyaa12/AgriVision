
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'fs/promises';
import * as path from 'path';

// Define the path to the mock user data file
const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'users.json');

// Define the schema for a user
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  state: z.string(),
  password: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// Define the input schema for the login function
const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

// Define the output schema for the login function
const LoginOutputSchema = z.object({
  success: z.boolean(),
  user: UserSchema.omit({ password: true }).optional(),
  message: z.string(),
});
export type LoginOutput = z.infer<typeof LoginOutputSchema>;

// Define the input schema for the signup function
const SignupInputSchema = UserSchema;
export type SignupInput = z.infer<typeof SignupInputSchema>;

// Define the output schema for the signup function
const SignupOutputSchema = z.object({
  success: z.boolean(),
  user: UserSchema.omit({ password: true }).optional(),
  message: z.string(),
});
export type SignupOutput = z.infer<typeof SignupOutputSchema>;


// Helper function to read users from the mock database
async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper function to write users to the mock database
async function writeUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
}


// --- Genkit Flows ---

/**
 * Logs in a user by checking their credentials against the mock database.
 */
export const loginUser = ai.defineFlow(
  {
    name: 'loginUserFlow',
    inputSchema: LoginInputSchema,
    outputSchema: LoginOutputSchema,
  },
  async ({ email, password }) => {
    const users = await readUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        message: 'Login successful.',
      };
    } else {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }
  }
);


/**
 * Signs up a new user, checking if they already exist and adding them to the mock database.
 */
export const signupUser = ai.defineFlow(
  {
    name: 'signupUserFlow',
    inputSchema: SignupInputSchema,
    outputSchema: SignupOutputSchema,
  },
  async (newUser) => {
    const users = await readUsers();
    
    // Check if user already exists
    const existingUser = users.find((u) => u.email === newUser.email);
    if (existingUser) {
      return {
        success: false,
        message: 'A user with this email already exists.',
      };
    }

    // Add new user
    users.push(newUser);
    await writeUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Signup successful!',
    };
  }
);
