const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

export type Money = { amount: string; currencyCode: string };

export type ShopifyImage = { url: string; altText: string | null; width: number; height: number };

export type ShopifyVariant = {
  id: string;
  title: string;
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
  tags: string[];
  options: { name: string; values: string[] }[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: {
    id: string;
    quantity: number;
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
    super(message);
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
    cache: options?.cache ?? "no-store",
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
  const endpoint = `https://${domain}/admin/api/2025-01/graphql.json`;
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
        availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
        image { url altText width height }
      }
    }
  }
`;

export async function getProducts(first = 50): Promise<ShopifyProduct[]> {
  const query = /* GraphQL */ `
    ${PRODUCT_FRAGMENT}
    query Products($first: Int!) {
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
  }>(query, { first }, { next: { tags: ["products"] } });
  return data.products.nodes.map((p) => ({
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
  }>(query, { handle }, { next: { tags: ["products"] } });
  if (!data.product) return null;
  return { ...data.product, images: data.product.images.nodes, variants: data.product.variants.nodes };
}

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
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

export async function cartCreate(): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartCreate { cartCreate { cart { ...CartFields } userErrors { message } } }
  `;
  const data = await shopifyFetch<{ cartCreate: { cart: RawCart; userErrors: { message: string }[] } }>(query);
  return normaliseCart(data.cartCreate.cart);
}

export async function cartLinesAdd(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { message }
      }
    }
  `;
  const data = await shopifyFetch<{ cartLinesAdd: { cart: RawCart; userErrors: { message: string }[] } }>(query, { cartId, lines });
  return normaliseCart(data.cartLinesAdd.cart);
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
  const data = await shopifyFetch<{ customerCreate: { customer: any; customerUserErrors: { message: string; field?: string[] }[] } }>(query, { input });
  return { customer: data.customerCreate.customer, errors: data.customerCreate.customerUserErrors };
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

export async function cartDiscountCodesUpdate(cartId: string, discountCodes: string[]): Promise<ShopifyCart> {
  const query = /* GraphQL */ `
    ${CART_FRAGMENT}
    mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
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
