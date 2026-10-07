/**
 * Brevo API integration for newsletter contact management
 *
 * API Documentation: https://developers.brevo.com/docs/synchronise-contact-lists
 *
 * Environment variables required:
 * - BREVO_API_KEY: Your Brevo API key (optional - gracefully handles missing key)
 * - BREVO_LIST_ID: The list ID to add contacts to (optional)
 */

const BREVO_API_BASE = 'https://api.brevo.com/v3';

interface BrevoContactAttributes {
  LANGUAGE?: string;
  FNAME?: string;
  LNAME?: string;
  [key: string]: string | undefined;
}

interface CreateContactParams {
  email: string;
  attributes?: BrevoContactAttributes;
  listIds?: number[];
  updateEnabled?: boolean;
}

interface BrevoApiResponse {
  id?: number;
  error?: string;
  message?: string;
}

/**
 * Check if Brevo integration is configured
 */
export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

/**
 * Get the configured list ID, if any
 */
function getListId(): number | undefined {
  const listId = process.env.BREVO_LIST_ID;
  if (listId) {
    const parsed = parseInt(listId, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Create or update a contact in Brevo
 *
 * @param params - Contact creation parameters
 * @returns Object with success status and optional contact ID or error
 */
export async function createBrevoContact(params: CreateContactParams): Promise<{
  success: boolean;
  contactId?: number;
  error?: string;
  skipped?: boolean;
}> {
  // Gracefully handle missing API key
  if (!isBrevoConfigured()) {
    console.log('[Brevo] API key not configured, skipping contact creation');
    return { success: true, skipped: true };
  }

  const { email, attributes = {}, listIds, updateEnabled = true } = params;

  // Build list IDs array
  const contactListIds: number[] = [];
  if (listIds && listIds.length > 0) {
    contactListIds.push(...listIds);
  }
  const defaultListId = getListId();
  if (defaultListId && !contactListIds.includes(defaultListId)) {
    contactListIds.push(defaultListId);
  }

  const requestBody: Record<string, unknown> = {
    email: email.toLowerCase().trim(),
    updateEnabled,
  };

  if (Object.keys(attributes).length > 0) {
    requestBody.attributes = attributes;
  }

  if (contactListIds.length > 0) {
    requestBody.listIds = contactListIds;
  }

  try {
    const response = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle successful creation (201) or update (204)
    if (response.status === 201) {
      const data: BrevoApiResponse = await response.json();
      console.log('[Brevo] Contact created successfully:', email);
      return { success: true, contactId: data.id };
    }

    if (response.status === 204) {
      console.log('[Brevo] Contact updated successfully:', email);
      return { success: true };
    }

    // Handle errors
    const errorData: BrevoApiResponse = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;

    console.error('[Brevo] Contact creation failed:', email, errorMessage);
    return { success: false, error: errorMessage };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Brevo] API request failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing contact in Brevo
 *
 * @param identifier - Email address or SMS (format: phone@mailin-sms.com)
 * @param attributes - Attributes to update
 * @returns Object with success status
 */
export async function updateBrevoContact(
  identifier: string,
  attributes: BrevoContactAttributes
): Promise<{
  success: boolean;
  error?: string;
  skipped?: boolean;
}> {
  // Gracefully handle missing API key
  if (!isBrevoConfigured()) {
    console.log('[Brevo] API key not configured, skipping contact update');
    return { success: true, skipped: true };
  }

  try {
    const response = await fetch(
      `${BREVO_API_BASE}/contacts/${encodeURIComponent(identifier)}`,
      {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ attributes }),
      }
    );

    // 204 indicates successful update
    if (response.status === 204) {
      console.log('[Brevo] Contact updated successfully:', identifier);
      return { success: true };
    }

    const errorData: BrevoApiResponse = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;

    console.error('[Brevo] Contact update failed:', identifier, errorMessage);
    return { success: false, error: errorMessage };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Brevo] API request failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Add a contact to specific lists
 *
 * @param identifier - Email address
 * @param listIds - Array of list IDs to add contact to
 */
export async function addContactToLists(
  identifier: string,
  listIds: number[]
): Promise<{
  success: boolean;
  error?: string;
  skipped?: boolean;
}> {
  if (!isBrevoConfigured()) {
    console.log('[Brevo] API key not configured, skipping list assignment');
    return { success: true, skipped: true };
  }

  try {
    const response = await fetch(
      `${BREVO_API_BASE}/contacts/${encodeURIComponent(identifier)}`,
      {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ listIds }),
      }
    );

    if (response.status === 204) {
      console.log('[Brevo] Contact added to lists:', identifier, listIds);
      return { success: true };
    }

    const errorData: BrevoApiResponse = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;

    return { success: false, error: errorMessage };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
