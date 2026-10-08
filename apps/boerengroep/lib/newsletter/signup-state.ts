export type SignupOutcome = 'thanks' | 'already' | 'invalid' | 'error';

/** Turns the answer of the subscribe route into what the visitor should see. */
export function outcomeOf(httpStatus: number, body: unknown): SignupOutcome {
  if (httpStatus >= 200 && httpStatus < 300) {
    const status = body && typeof body === 'object' ? (body as { status?: unknown }).status : undefined;
    return status === 'already' ? 'already' : 'thanks';
  }
  return httpStatus === 400 ? 'invalid' : 'error';
}
