"use server";

import { cookies } from "next/headers";
import {
  customerCreate,
  customerAccessTokenCreate,
  customerAccessTokenDelete,
  getCustomer,
  customerAssociateCart,
  shopifyAdminFetch,
} from "./shopify";

const COOKIE = "hhara_customer_token";

async function writeToken(token: string, expiresAt: string) {
  const c = await cookies();
  const expires = new Date(expiresAt);
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

async function readToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE)?.value || null;
}

async function clearToken() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function signUp(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  acceptsMarketing?: boolean;
}): Promise<{ ok: boolean; error?: string; status?: "TAKEN" | "ACTIVATION_SENT" | "EXISTS" }> {
  const { dob, ...rest } = input;
  const created = await customerCreate({ ...rest, ...(dob ? { note: `DOB: ${dob}` } : {}) });
  if (created.errors.length) {
    const errorMsg = created.errors[0].message;
    const isEmailTaken = errorMsg?.toLowerCase().includes("taken") || (created.errors[0] as any).code === "TAKEN";
    if (isEmailTaken) {
      try {
        // Query Admin API to see customer state
        const query = `
          query GetCustomer($query: String!) {
            customers(first: 1, query: $query) {
              nodes {
                id
                state
              }
            }
          }
        `;
        const data = await shopifyAdminFetch<{ customers: { nodes: { id: string; state: string }[] } }>(query, {
          query: `email:${input.email}`
        });
        const customer = data.customers.nodes[0];
        if (customer) {
          if (customer.state === "DISABLED" || customer.state === "INVITED") {
            // Send activation email
            const activationQuery = `
              mutation SendActivation($id: ID!) {
                customerSendActivationEmail(customerId: $id) {
                  activationUrl
                  userErrors { message }
                }
              }
            `;
            const actRes = await shopifyAdminFetch<{ customerSendActivationEmail: { activationUrl: string | null; userErrors: any[] } }>(
              activationQuery,
              { id: customer.id }
            );
            if (actRes.customerSendActivationEmail.userErrors.length === 0) {
              return {
                ok: false,
                status: "ACTIVATION_SENT",
                error: "An account under this email already exists as a guest (e.g. from your newsletter subscription). We have sent you an activation email to set up your password and complete your registration."
              };
            }
          }
          return {
            ok: false,
            status: "EXISTS",
            error: "An account under this email already exists. Please log in directly, or click 'Forgot Password' if you need to reset it."
          };
        }
      } catch (err) {
        console.error("[signUp] Admin account recovery check failed:", err);
      }
    }
    return { ok: false, error: errorMsg };
  }
  // Auto-login after signup
  const tok = await customerAccessTokenCreate(input.email, input.password);
  if (!tok.token) return { ok: false, error: tok.errors[0]?.message || "Login after signup failed" };
  await writeToken(tok.token.accessToken, tok.token.expiresAt);
  
  // Link guest cart to customer account if present
  const cCookie = await cookies();
  const cartId = cCookie.get("hhara_cart_id")?.value;
  if (cartId) {
    try { await customerAssociateCart(cartId, tok.token.accessToken); } catch {}
  }

  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const tok = await customerAccessTokenCreate(email, password);
  if (!tok.token) return { ok: false, error: tok.errors[0]?.message || "Invalid credentials" };
  await writeToken(tok.token.accessToken, tok.token.expiresAt);

  // Link guest cart to customer account if present
  const cCookie = await cookies();
  const cartId = cCookie.get("hhara_cart_id")?.value;
  if (cartId) {
    try { await customerAssociateCart(cartId, tok.token.accessToken); } catch {}
  }

  return { ok: true };
}

export async function signOut(): Promise<void> {
  const token = await readToken();
  if (token) {
    try { await customerAccessTokenDelete(token); } catch {}
  }
  await clearToken();
}

export async function getCurrentCustomer() {
  const token = await readToken();
  if (!token) return null;
  try {
    return await getCustomer(token);
  } catch {
    await clearToken();
    return null;
  }
}

export async function attachCustomerToCart(cartId: string): Promise<void> {
  const token = await readToken();
  if (!token) return;
  try { await customerAssociateCart(cartId, token); } catch {}
}
