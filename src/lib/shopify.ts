const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN!;

/**
 * Storefront + Admin API version. Owned by the code, not by an env var: the queries below are written against this
 * schema, so changing it is a code change. Shopify supports a version for ~12 months and then silently serves the
 * oldest supported one instead (2025-01 was being answered as 2026-01). Check every year:
 * https://shopify.dev/docs/api/usage/versioning
 */
export const SHOPIFY_API_VERSION = "2026-07";

const ENDPOINT = `https://${DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export type Money = { amount: string; currencyCode: string };

export type ShopifyImage = { url: string; altText: string | null; width: number; height: number };

export type ShopifyVariant = {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  price: Money;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  isGiftCard: boolean;
  tags: string[];
  options: { name: string; values: string[] }[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  metafield?: any;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  buyerIdentity: { countryCode: string | null };
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: {
    id: string;
    quantity: number;
    attributes: { key: string; value: string }[];
    cost: { totalAmount: Money };
    merchandise: {
      id: string;
      title: string;
      image: ShopifyImage | null;
      product: { title: string; handle: string };
      selectedOptions: { name: string; value: string }[];
    };
  }[];
  discountCodes: { code: string; applicable: boolean }[];
};

class ShopifyError extends Error {
  constructor(message: string, public detail?: unknown) {
    // Put Shopify's own message in the error text: console.error prints nested arrays as "[Array]", which hid the cause
    super(detail === undefined ? message : `${message}: ${describe(detail)}`);
  }
}

function describe(detail: unknown): string {
  try {
    return (typeof detail === "string" ? detail : JSON.stringify(detail)).slice(0, 1000);
  } catch {
    return String(detail);
  }
}

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options?: {
    cache?: RequestCache;
    next?: any;
  }
): Promise<T> {
  if (!DOMAIN || !TOKEN) {
    throw new ShopifyError("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN env vars");
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    // Callers that pass `next` (revalidate/tags) want the Data Cache. Defaulting those to "no-store" made Next drop both
    // settings as conflicting, so catalogue reads hit Shopify on every render. Everything else (cart, customer) stays no-store.
    cache: options?.cache ?? (options?.next ? "force-cache" : "no-store"),
    next: options?.next,
  });

  if (!res.ok) {
    throw new ShopifyError(`Shopify HTTP ${res.status}`, await res.text());
  }
  const body = (await res.json()) as { data?: T; errors?: unknown };
  if (body.errors) throw new ShopifyError("Shopify GraphQL errors", body.errors);
  return body.data as T;
}

export async function shopifyAdminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!adminToken || !domain) {
    throw new ShopifyError("Missing SHOPIFY_ADMIN_TOKEN or SHOPIFY_STORE_DOMAIN environment variables.");
  }
  const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ShopifyError(`Shopify Admin HTTP ${res.status}`, await res.text());
  }
  const body = (await res.json()) as { data?: T; errors?: unknown };
  if (body.errors) throw new ShopifyError("Shopify Admin GraphQL errors", body.errors);
  return body.data as T;
}

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    isGiftCard
    tags
    options { name values }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    featuredImage { url altText width height }
    images(first: 10) {
      nodes { url altText width height }
    }
    variants(first: 100) {
      nodes {
        id
        title
        sku
        availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
        image { url altText width height }
      }
    }
    metafield(namespace: "custom", key: "floating_video") {
      id
      namespace
      key
      value
      reference {
        ... on Video {
          id
          sources {
            url
            mimeType
            format
          }
          previewImage {
            url
          }
        }
      }
    }
  }
`;

// `country` prices the products in that country's market currency (null = store default, AED).
export async function getProducts(first = 50, country: string | null = null): Promise<ShopifyProduct[]> {
  const query = /* GraphQL */ `
    ${PRODUCT_FRAGMENT}
    query Products($first: Int!, $country: CountryCode) @inContext(country: $country) {
      products(first: $first) {
        nodes { ...ProductFields }
      }
    }
  `;
  const data = await shopifyFetch<{
    products: { nodes: Array<Omit<ShopifyProduct, "images" | "variants"> & {
      images: { nodes: ShopifyImage[] };
      variants: { nodes: ShopifyVariant[] };
    }> };
  }>(query, { first, country }, { next: { tags: ["products"], revalidate: 3600 } });
  // Gift cards are sold from their own page, never listed with the collection
  return data.products.nodes
    .filter((p) => !p.isGiftCard)
    .map((p) => ({
      ...p,
      images: p.images.nodes,
      variants: p.variants.nodes,
    }));
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const query = /* GraphQL */ `
    ${PRODUCT_FRAGMENT}
    query ProductByHandle($handle: String!) {
      product(handle: $handle) { ...ProductFields }
    }
  `;
  const data = await shopifyFetch<{
    product:
      | (Omit<ShopifyProduct, "images" | "variants"> & {
          images: { nodes: ShopifyImage[] };
          variants: { nodes: ShopifyVariant[] };
        })
      | null;
  }>(query, { handle }, { next: { tags: ["products"], revalidate: 3600 } });
  if (!data.product) return null;
  return { ...data.product, images: data.product.images.nodes, variants: data.product.variants.nodes };
}

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    buyerIdentity { countryCode }
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        attributes { key value }
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            image { url altText width height }
            product { title handle }
            selectedOptions { name value }
          }
        }
      }
    }
    discountCodes {
      code
      applicable
    }
  }
`;

// The cart's country sets the currency its prices and checkout use.
export async function cartCreate(country: string | null = null): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartCreate($input: CartInput) { cartCreate(input: $input) { cart { ...CartFields } userErrors { message } } }
  `;
  const input = country ? { buyerIdentity: { countryCode: country } } : {};
  const data = await shopifyFetch<{ cartCreate: { cart: RawCart; userErrors: { message: string }[] } }>(query, { input });
  return normaliseCart(data.cartCreate.cart);
}

export async function cartCountryUpdate(cartId: string, country: string): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartCountry($cartId: ID!, $country: CountryCode!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: { countryCode: $country }) {
        cart { ...CartFields }
        userErrors { message }
      }
    }
  `;
  const data = await shopifyFetch<{ cartBuyerIdentityUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(
    query,
    { cartId, country }
  );
  return normaliseCart(data.cartBuyerIdentityUpdate.cart);
}

/** Country → currency Shopify charges in, for every country we sell to. */
export async function getCountryCurrencies(): Promise<Record<string, string>> {
  const query = /* GraphQL */ `
    query Countries { localization { availableCountries { isoCode currency { isoCode } } } }
  `;
  const data = await shopifyFetch<{
    localization: { availableCountries: { isoCode: string; currency: { isoCode: string } }[] };
  }>(query, {}, { next: { revalidate: 3600 } });
  return Object.fromEntries(data.localization.availableCountries.map((c) => [c.isoCode, c.currency.isoCode]));
}

type CartLineInput = { merchandiseId: string; quantity: number; attributes?: { key: string; value: string }[] };

export async function cartLinesAdd(cartId: string, lines: CartLineInput[]): Promise<ShopifyCart> {
  return (await cartLinesAddWithErrors(cartId, lines)).cart;
}

// Same as cartLinesAdd, but also returns Shopify's userErrors (e.g. invalid gift card recipient)
export async function cartLinesAddWithErrors(
  cartId: string,
  lines: CartLineInput[]
): Promise<{ cart: ShopifyCart; userErrors: { message: string; code?: string }[] }> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { message code }
      }
    }
  `;
  const data = await shopifyFetch<{ cartLinesAdd: { cart: RawCart; userErrors: { message: string; code?: string }[] } }>(query, { cartId, lines });
  return { cart: normaliseCart(data.cartLinesAdd.cart), userErrors: data.cartLinesAdd.userErrors };
}

export async function cartLinesUpdate(cartId: string, lines: { id: string; quantity: number }[]): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { message }
      }
    }
  `;
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(query, { cartId, lines });
  return normaliseCart(data.cartLinesUpdate.cart);
}

export async function cartLinesRemove(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        userErrors { message }
      }
    }
  `;
  const data = await shopifyFetch<{ cartLinesRemove: { cart: RawCart; userErrors: { message: string }[] } }>(query, { cartId, lineIds });
  return normaliseCart(data.cartLinesRemove.cart);
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    query GetCart($cartId: ID!) { cart(id: $cartId) { ...CartFields } }
  `;
  const data = await shopifyFetch<{ cart: RawCart | null }>(query, { cartId });
  return data.cart ? normaliseCart(data.cart) : null;
}

export async function cartAttributesUpdate(
  cartId: string,
  attributes: { key: string; value: string }[]
): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
      cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
        cart { ...CartFields }
        userErrors { message }
      }
    }
  `;
  const data = await shopifyFetch<{ cartAttributesUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(
    query,
    { cartId, attributes }
  );
  return normaliseCart(data.cartAttributesUpdate.cart);
}

type RawCart = Omit<ShopifyCart, "lines"> & { lines: { nodes: ShopifyCart["lines"] } };
function normaliseCart(c: RawCart): ShopifyCart {
  return { ...c, lines: c.lines.nodes };
}

// ─── Customer Account (Storefront API) ──────────────────────────────

export type ShopifyCustomer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  acceptsMarketing: boolean;
  orders: {
    id: string;
    orderNumber: number;
    processedAt: string;
    financialStatus: string | null;
    fulfillmentStatus: string | null;
    totalPrice: Money;
    lineItems: { title: string; quantity: number }[];
  }[];
};

export type CustomerAccessToken = { accessToken: string; expiresAt: string };

export async function customerCreate(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  note?: string;
  acceptsMarketing?: boolean;
}): Promise<{ customer?: { id: string; email: string }; errors: { message: string; field?: string[] }[] }> {
  const query = /* GraphQL */ `
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email }
        customerUserErrors { message field code }
      }
    }
  `;
  // The Storefront API has no `note` field on CustomerCreateInput, so it's saved via the Admin API afterwards
  const { note, ...storefrontInput } = input;
  const data = await shopifyFetch<{ customerCreate: { customer: any; customerUserErrors: { message: string; field?: string[] }[] } }>(query, { input: storefrontInput });
  const customer = data.customerCreate.customer;
  if (customer && note) await setCustomerNote(customer.id, note);
  return { customer, errors: data.customerCreate.customerUserErrors };
}

// An existing customer signing up again isn't touched by the Storefront customerCreate,
// so mark them as an email subscriber here (the sign-up discount is limited to subscribers).
// Best effort: a failure here must not fail the signup itself.
export async function subscribeExistingCustomer(email: string, tags: string[] = []): Promise<void> {
  try {
    const found = await shopifyAdminFetch<{ customers: { nodes: { id: string; defaultEmailAddress: { marketingState: string } | null }[] } }>(
      /* GraphQL */ `
        query FindCustomer($q: String!) {
          customers(first: 1, query: $q) { nodes { id defaultEmailAddress { marketingState } } }
        }
      `,
      { q: `email:"${email.replace(/"/g, "")}"` }
    );
    const customer = found.customers.nodes[0];
    if (!customer) return;
    if (tags.length) {
      const tagged = await shopifyAdminFetch<{ tagsAdd: { userErrors: { message: string }[] } }>(
        /* GraphQL */ `
          mutation Tag($id: ID!, $tags: [String!]!) {
            tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
          }
        `,
        { id: customer.id, tags }
      );
      if (tagged.tagsAdd.userErrors.length) console.error("[subscribeExistingCustomer] tags", tagged.tagsAdd.userErrors);
    }
    if (customer.defaultEmailAddress?.marketingState === "SUBSCRIBED") return;
    const data = await shopifyAdminFetch<{ customerEmailMarketingConsentUpdate: { userErrors: { message: string }[] } }>(
      /* GraphQL */ `
        mutation Consent($input: CustomerEmailMarketingConsentUpdateInput!) {
          customerEmailMarketingConsentUpdate(input: $input) { userErrors { field message } }
        }
      `,
      {
        input: {
          customerId: customer.id,
          emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
        },
      }
    );
    if (data.customerEmailMarketingConsentUpdate.userErrors.length) {
      console.error("[subscribeExistingCustomer]", data.customerEmailMarketingConsentUpdate.userErrors);
    }
  } catch (err) {
    console.error("[subscribeExistingCustomer]", err);
  }
}

// Hosts Shopify uses in account emails. Activation and reset links are built on the store's
// PRIMARY domain (e.g. checkout.hhara.com), not the .myshopify.com API domain, so a check
// against SHOPIFY_STORE_DOMAIN alone rejects every genuine link.
let accountLinkHostsCache: { hosts: string[]; at: number } | null = null;
export async function getAccountLinkHosts(): Promise<string[]> {
  if (accountLinkHostsCache && Date.now() - accountLinkHostsCache.at < 60 * 60 * 1000) return accountLinkHostsCache.hosts;
  const hosts = [process.env.SHOPIFY_STORE_DOMAIN].filter(Boolean) as string[];
  try {
    const data = await shopifyFetch<{ shop: { primaryDomain: { host: string } } }>(
      /* GraphQL */ `query PrimaryDomain { shop { primaryDomain { host } } }`
    );
    if (data.shop.primaryDomain?.host) hosts.push(data.shop.primaryDomain.host);
    accountLinkHostsCache = { hosts, at: Date.now() };
  } catch (err) {
    console.error("[getAccountLinkHosts]", err);
  }
  return hosts;
}

// Shopify customer account states (Admin API): ENABLED has a password; DISABLED is a
// subscriber or guest with no account yet; INVITED and DECLINED were sent an invite.
export type CustomerAccountState = "ENABLED" | "DISABLED" | "INVITED" | "DECLINED";

export async function findCustomerByEmail(email: string): Promise<{ id: string; state: CustomerAccountState } | null> {
  const data = await shopifyAdminFetch<{ customers: { nodes: { id: string; state: CustomerAccountState }[] } }>(
    /* GraphQL */ `
      query FindCustomerByEmail($q: String!) {
        customers(first: 1, query: $q) { nodes { id state } }
      }
    `,
    // Quoted: an unquoted address is split by Shopify's search syntax and can match nothing
    { q: `email:"${email.trim().toLowerCase().replace(/"/g, "")}"` }
  );
  return data.customers.nodes[0] ?? null;
}

// Emails the store's "Customer account invite" notification, whose link lets the customer
// choose a password and turn their subscriber record into an account.
export async function sendAccountInvite(customerId: string): Promise<boolean> {
  const data = await shopifyAdminFetch<{ customerSendAccountInviteEmail: { userErrors: { message: string }[] } }>(
    /* GraphQL */ `
      mutation SendInvite($customerId: ID!) {
        customerSendAccountInviteEmail(customerId: $customerId) { userErrors { field message } }
      }
    `,
    { customerId }
  );
  const errs = data.customerSendAccountInviteEmail.userErrors;
  if (errs.length) console.error("[sendAccountInvite]", errs);
  return errs.length === 0;
}

// Newsletter sign-up: a customer record with email marketing consent and NO password, so
// no account is created. If they later create an account with the same email, they get an
// invite to set a password (see signUp). The Storefront API can't do this: its
// customerCreate always makes a full account and requires a password.
export async function createSubscriber(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  note?: string;
  tags?: string[];
}): Promise<{ ok: boolean; taken: boolean; emailInvalid: boolean }> {
  const data = await shopifyAdminFetch<{
    customerCreate: { customer: { id: string } | null; userErrors: { field: string[] | null; message: string }[] };
  }>(
    /* GraphQL */ `
      mutation CreateSubscriber($input: CustomerInput!) {
        customerCreate(input: $input) { customer { id } userErrors { field message } }
      }
    `,
    {
      input: {
        ...input,
        emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
      },
    }
  );
  const errs = data.customerCreate.userErrors;
  if (!errs.length) return { ok: true, taken: false, emailInvalid: false };
  const taken = errs.some((e) => /taken|already/i.test(e.message));
  if (!taken) console.error("[createSubscriber]", errs);
  return { ok: false, taken, emailInvalid: errs.some((e) => e.field?.includes("email") && !/taken|already/i.test(e.message)) };
}

// Best effort: a failure here must not fail the signup itself.
export async function setCustomerNote(customerId: string, note: string): Promise<void> {
  const query = /* GraphQL */ `
    mutation SetCustomerNote($input: CustomerInput!) {
      customerUpdate(input: $input) {
        userErrors { field message }
      }
    }
  `;
  try {
    const data = await shopifyAdminFetch<{ customerUpdate: { userErrors: { message: string }[] } }>(query, {
      input: { id: customerId, note },
    });
    if (data.customerUpdate.userErrors.length) console.error("[setCustomerNote]", data.customerUpdate.userErrors);
  } catch (err) {
    console.error("[setCustomerNote]", err);
  }
}

export async function customerAccessTokenCreate(email: string, password: string): Promise<{ token?: CustomerAccessToken; errors: { message: string }[] }> {
  const query = /* GraphQL */ `
    mutation TokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { message }
      }
    }
  `;
  const data = await shopifyFetch<{ customerAccessTokenCreate: { customerAccessToken: CustomerAccessToken | null; customerUserErrors: { message: string }[] } }>(query, { input: { email, password } });
  return { token: data.customerAccessTokenCreate.customerAccessToken ?? undefined, errors: data.customerAccessTokenCreate.customerUserErrors };
}

// Sends Shopify's "Customer account password reset" email. Shopify returns no error for an
// unknown email, so this can't be used to discover which emails have accounts.
export async function customerRecover(email: string): Promise<{ errors: { message: string; code?: string }[] }> {
  const query = /* GraphQL */ `
    mutation CustomerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors { message code }
      }
    }
  `;
  const data = await shopifyFetch<{ customerRecover: { customerUserErrors: { message: string; code?: string }[] } }>(query, { email });
  return { errors: data.customerRecover.customerUserErrors };
}

type PasswordByUrlResult = { token?: CustomerAccessToken; errors: { message: string; code?: string }[] };

// Sets a new password from the link in the password reset email.
export async function customerResetByUrl(resetUrl: string, password: string): Promise<PasswordByUrlResult> {
  const query = /* GraphQL */ `
    mutation CustomerResetByUrl($resetUrl: URL!, $password: String!) {
      customerResetByUrl(resetUrl: $resetUrl, password: $password) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { message code }
      }
    }
  `;
  const data = await shopifyFetch<{ customerResetByUrl: { customerAccessToken: CustomerAccessToken | null; customerUserErrors: { message: string; code?: string }[] } }>(query, { resetUrl, password });
  return { token: data.customerResetByUrl.customerAccessToken ?? undefined, errors: data.customerResetByUrl.customerUserErrors };
}

// Activates an invited account (e.g. a newsletter subscriber) from the link in the account invite email.
export async function customerActivateByUrl(activationUrl: string, password: string): Promise<PasswordByUrlResult> {
  const query = /* GraphQL */ `
    mutation CustomerActivateByUrl($activationUrl: URL!, $password: String!) {
      customerActivateByUrl(activationUrl: $activationUrl, password: $password) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { message code }
      }
    }
  `;
  const data = await shopifyFetch<{ customerActivateByUrl: { customerAccessToken: CustomerAccessToken | null; customerUserErrors: { message: string; code?: string }[] } }>(query, { activationUrl, password });
  return { token: data.customerActivateByUrl.customerAccessToken ?? undefined, errors: data.customerActivateByUrl.customerUserErrors };
}

export async function customerAccessTokenDelete(token: string): Promise<void> {
  const query = /* GraphQL */ `
    mutation TokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        userErrors { message }
      }
    }
  `;
  await shopifyFetch(query, { customerAccessToken: token });
}

export async function getCustomer(token: string): Promise<ShopifyCustomer | null> {
  const query = /* GraphQL */ `
    query Customer($token: String!) {
      customer(customerAccessToken: $token) {
        id firstName lastName email phone acceptsMarketing
        orders(first: 25, sortKey: PROCESSED_AT, reverse: true) {
          nodes {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice { amount currencyCode }
            lineItems(first: 10) {
              nodes { title quantity }
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch<{ customer: any }>(query, { token });
  if (!data.customer) return null;
  return {
    ...data.customer,
    orders: data.customer.orders.nodes.map((o: any) => ({
      ...o,
      lineItems: o.lineItems.nodes,
    })),
  };
}

export async function customerAssociateCart(cartId: string, token: string): Promise<void> {
  const query = /* GraphQL */ `
    mutation Associate($cartId: ID!, $token: String!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: { customerAccessToken: $token }) {
        userErrors { message }
      }
    }
  `;
  await shopifyFetch(query, { cartId, token });
}

// ─── Order tracking (guest lookup via Admin API) ────────────────────

export type OrderTrackingFulfillment = {
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  estimatedDeliveryAt: string | null;
  trackingInfo: { number: string | null; url: string | null; company: string | null }[];
};

export type OrderTracking = {
  id: string;
  name: string;
  email: string | null;
  processedAt: string | null;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  totalPrice: Money;
  lineItems: { title: string; quantity: number; image: ShopifyImage | null }[];
  shippingAddress: {
    name: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    zip: string | null;
  } | null;
  fulfillments: OrderTrackingFulfillment[];
};

export async function getOrderByNameAndEmail(
  orderName: string,
  email: string
): Promise<OrderTracking | null> {
  const normalizedName = orderName.trim().startsWith("#") ? orderName.trim() : `#${orderName.trim()}`;
  const normalizedEmail = email.trim().toLowerCase();

  const query = /* GraphQL */ `
    query FindOrder($query: String!) {
      orders(first: 1, query: $query) {
        nodes {
          id
          name
          email
          processedAt
          displayFinancialStatus
          displayFulfillmentStatus
          currentTotalPriceSet { shopMoney { amount currencyCode } }
          shippingAddress {
            name address1 address2 city province country zip
          }
          lineItems(first: 50) {
            nodes {
              title
              quantity
              image { url altText width height }
            }
          }
          fulfillments(first: 10) {
            status
            createdAt
            updatedAt
            estimatedDeliveryAt
            trackingInfo { number url company }
          }
        }
      }
    }
  `;

  const searchQuery = `name:${normalizedName} email:${normalizedEmail}`;
  const data = await shopifyAdminFetch<{
    orders: {
      nodes: Array<{
        id: string;
        name: string;
        email: string | null;
        processedAt: string | null;
        displayFinancialStatus: string | null;
        displayFulfillmentStatus: string | null;
        currentTotalPriceSet: { shopMoney: Money };
        shippingAddress: OrderTracking["shippingAddress"];
        lineItems: { nodes: { title: string; quantity: number; image: ShopifyImage | null }[] };
        fulfillments: Array<{
          status: string | null;
          createdAt: string | null;
          updatedAt: string | null;
          estimatedDeliveryAt: string | null;
          trackingInfo: { number: string | null; url: string | null; company: string | null }[];
        }>;
      }>;
    };
  }>(query, { query: searchQuery });

  const order = data.orders.nodes[0];
  if (!order) return null;
  // Defense-in-depth: verify email match even though we filtered in the query
  if (!order.email || order.email.toLowerCase() !== normalizedEmail) return null;

  return {
    id: order.id,
    name: order.name,
    email: order.email,
    processedAt: order.processedAt,
    displayFinancialStatus: order.displayFinancialStatus,
    displayFulfillmentStatus: order.displayFulfillmentStatus,
    totalPrice: order.currentTotalPriceSet.shopMoney,
    shippingAddress: order.shippingAddress,
    lineItems: order.lineItems.nodes,
    fulfillments: order.fulfillments,
  };
}

export async function cartDiscountCodesUpdate(cartId: string, discountCodes: string[]): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
      cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart { ...CartFields }
        userErrors { message }
      }
    }
  `;
  const data = await shopifyFetch<{ cartDiscountCodesUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(
    query,
    { cartId, discountCodes }
  );
  return normaliseCart(data.cartDiscountCodesUpdate.cart);
}
