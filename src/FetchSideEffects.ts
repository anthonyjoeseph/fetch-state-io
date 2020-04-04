import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';
import * as BQ from './util/BodyRequest';
import * as BS from './util/BodyResponse';
import { SideEffect } from 'react-state-io';
import * as P from 'react-state-io/dist/util/Parser2';
import * as ST from 'react-state-io/dist/util/StateTask';

export interface ParsedEndpoint<S, P, O> {
  type: 'parsedEndpoint';
  requestInfo: RequestInfo;
  init?: RequestInit;
  parser: (i: object) => t.Validation<O>;
  handleResponse: (resp: E.Either<Error | t.Errors, O>) => (p: P) => ST.StateTask<() => S, O.Option<P>>;
}

export interface UnparsedEndpoint<S, P> {
  type: 'unparsedEndpoint';
  requestInfo: RequestInfo;
  init?: RequestInit;
  bodyRequest: BQ.BodyRequest;
  handleResponse: (resp: E.Either<Error, BS.BodyResponse>) => (p: P) => ST.StateTask<() => S, O.Option<P>>;
}
const endpointPredicate = <S, P, O = unknown>(
  p: ParsedEndpoint<S, P, O> | UnparsedEndpoint<S, P>
): p is ParsedEndpoint<S, P, O> => p.type === 'parsedEndpoint';

const promTaskify = <A, E = Error>(
  prom: () => Promise<A>,
): TE.TaskEither<E, A> => (): Promise<E.Either<E, A>> => prom().then(
  (result: A) => E.right(result),
  (error: E) => E.left(error),
);

/**
 * Uses fetch to transform global state 
 * @template S - Global app state
 * @template P - Parameterizes toEndpoint, allowing the user to define their own type to represent endpoints
 * @template O - User-defined route type
 * @param extractEndpoint - Converts data of type P into an Endpoint object that describes a fetch request and handles it's response
 * @returns an side effect handler capable of transforming global state and invoking side effects
 */
const fetchSideEffects = <S, P, O = unknown>(
  extractEndpoint: P.Parser2<P, ParsedEndpoint<S, P, O> | UnparsedEndpoint<S, P>>,
): SideEffect<S, P> => (
  param: P,
) => (
  stateThunk: () => S
): T.Task<[O.Option<P>, () => S]> => pipe(
  extractEndpoint.run(param),
  O.map(([someEndpoint, param]): T.Task<[O.Option<P>, () => S]> => {
    if (endpointPredicate(someEndpoint)) {
      return pipe(
        promTaskify(() => fetch(someEndpoint.requestInfo, someEndpoint.init)),
        TE.chain(
          (r): TE.TaskEither<Error, object> => promTaskify(() => r.json()),
        ),
        T.map(E.chain((obj): E.Either<t.Errors | Error, O> => someEndpoint.parser(obj))),
        T.chain((response) => someEndpoint.handleResponse(response)(param)(stateThunk))
      );
    }
    return pipe(
      promTaskify(() => fetch(someEndpoint.requestInfo, someEndpoint.init)),
      TE.chain((r: Response): TE.TaskEither<Error, BS.BodyResponse> => {
        const four = BQ.fold<TE.TaskEither<Error, BS.BodyResponse>>(
          () => TE.taskEither.map(promTaskify(() => r.arrayBuffer()), (ab) => BS.arrayBuffer(ab)),
          () => TE.taskEither.map(promTaskify(() => r.blob()), (blob) => BS.blob(blob)),
          () => TE.taskEither.map(promTaskify(() => r.formData()), (formData) => BS.formData(formData)),
          () => TE.taskEither.map(promTaskify(() => r.text()), (text) => BS.text(text)),
        );
        return four(someEndpoint.bodyRequest);
      }),
      T.chain((response) => someEndpoint.handleResponse(response)(param)(stateThunk)),
    );
  }),
  O.getOrElse(() => T.task.of<[O.Option<P>, () => S]>([O.none, stateThunk]))
)

export default fetchSideEffects;
