export type SignupOutcome = 'thanks' | 'invalid' | 'error';

/** Turns the answer of the subscribe route into what the visitor should see. */
export function outcomeOf(httpStatus: number): SignupOutcome {
  if (httpStatus >= 200 && httpStatus < 300) return 'thanks';
  return httpStatus === 400 ? 'invalid' : 'error';
}
