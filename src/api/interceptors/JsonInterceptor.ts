import { Interceptor, InterceptorInterface, Action } from 'routing-controllers';

@Interceptor()
export class JsonInterceptor implements InterceptorInterface {
  intercept(action: Action, content: any) {
    return JSON.parse(JSON.stringify(content));
  }
}
