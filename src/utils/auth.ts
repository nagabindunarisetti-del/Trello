/**
 * Browser-only auth service (demo).
 * Later, replace the bodies of registerUser / loginUser / logoutUser /
 * getCurrentUser with real API calls and the rest of the app won't change.
 */
 
const ACCOUNTS_KEY = "taskflow_accounts";
const SESSION_KEY = "taskflow_session";
 
export interface User {
  id: string;
  name: string;
  email: string;
}
 
interface Account extends User {
  salt: string;
  passwordHash: string;
}
 
/* ---------- helpers ---------- */
 
const readAccounts = (): Account[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};
 
const writeAccounts = (accounts: Account[]) =>
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
 
const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
 
const randomSalt = () =>
  toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
 
const hashPassword = async (password: string, salt: string) =>
  toHex(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(salt + password)
    )
  );
 
const toPublicUser = ({ id, name, email }: Account): User => ({
  id,
  name,
  email,
});
 
const normalizeEmail = (email: string) => email.trim().toLowerCase();
 
/* ---------- public API ---------- */
 
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const cleanName = name.trim();
  const cleanEmail = normalizeEmail(email);
 
  if (cleanName.length < 2) {
    throw new Error("Please enter your name (at least 2 characters).");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
 
  const accounts = readAccounts();
 
  if (accounts.some((a) => a.email === cleanEmail)) {
    throw new Error("An account with this email already exists. Please log in.");
  }
 
  const salt = randomSalt();
 
  const account: Account = {
    id: crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    salt,
    passwordHash: await hashPassword(password, salt),
  };
 
  writeAccounts([...accounts, account]);
  localStorage.setItem(SESSION_KEY, account.id); // auto login after register
 
  return toPublicUser(account);
}
 
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const cleanEmail = normalizeEmail(email);
  const account = readAccounts().find((a) => a.email === cleanEmail);
 
  // Same message for both cases so we don't reveal which emails exist
  const invalid = new Error("Invalid email or password.");
 
  if (!account) throw invalid;
 
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.passwordHash) throw invalid;
 
  localStorage.setItem(SESSION_KEY, account.id);
  return toPublicUser(account);
}
 
export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}
 
export function getCurrentUser(): User | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
 
  const account = readAccounts().find((a) => a.id === id);
  return account ? toPublicUser(account) : null;
}