import { Activation } from "./Activation";
import { ActivationType } from "./ActivationType";
import { ConfigurableObject } from "./ConfigurableObject";

export class Toq<TMock extends object> {
    private callstackSymbol: symbol = Symbol("Call Stack");

    private configurations: InternalConfig[] = [];

    public setup<TReturn>(setup: (config: TMock) => TReturn | void): MockConfig<TReturn> {
        let configObject = new ConfigurableObject();
        setup(configObject.object);
        let oldMatches = this.configurations.filter(x => x.isPerfectMatch(configObject.callStack));

        let configuration = new InternalConfig(configObject.callStack);
        if (oldMatches.length)
            configuration = oldMatches[0];

        this.configurations.push(configuration);
        return configuration.asPublic<TReturn>();
    }

    public verify<TReturn>(verify: (config: TMock) => TReturn | void) : void {
        let configObject = new ConfigurableObject();
        verify(configObject.object);
        let matched = this.configurations.filter(x => x.isPerfectMatch(configObject.callStack));
        let complete = matched.filter(x => x.called);
        if (!complete.length)
            throw new TypeError("Expected call");
    }

    private toName(thing: string | number | symbol): string {
        if (typeof (thing) == "symbol") {
            return Symbol.keyFor(thing as symbol);
        } else {
            return (thing as string | number).toString();
        }
    }

    public get object(): TMock {
        let callstack: Activation[] = [];

        let buildAnon = (): TMock => {
            let handler: ProxyHandler<any> = {
                get: (target, prop) => {
                    callstack.push(new Activation(ActivationType.PropertyGet, null, prop));

                    let done = this.configurations.filter(x => x.isPerfectMatch(callstack));
                    if (done.length > 0)
                        return done[0].call([]);

                    if (!this.configurations.some(x => x.isMatch(callstack)))
                        throw new TypeError("Call " + this.toName(prop) + " was not set up");

                    return buildAnon();
                },
                set: (target, prop, value) => {
                    callstack.push(new Activation(ActivationType.PropetySet, [value], prop));

                    let done = this.configurations.filter(x => x.isPerfectMatch(callstack));
                    if (done.length > 0) {
                        done[0].call([value]);
                        return true;
                    }

                    if (!this.configurations.some(x => x.isMatch(callstack)))
                        throw new TypeError("Call " + this.toName(prop) + " was not set up");

                    return true;
                },
                apply: (target, thisArg, argumentsList) => {
                    callstack.push(new Activation(ActivationType.FunctionCall, [...argumentsList]));

                    let done = this.configurations.filter(x => x.isPerfectMatch(callstack));
                    if (done.length > 0)
                        return done[0].call([...argumentsList]);

                    if (!this.configurations.some(x => x.isMatch(callstack)))
                        throw new TypeError("Call was not set up");

                    return buildAnon();
                }
            };

            return new Proxy(() => { }, handler);
        }

        return buildAnon();
    }
}

class MockConfig<TReturn> {
    constructor(private config: InternalConfig) {

    }

    returns(value: TReturn) : MockConfig<TReturn> {
        this.config.return = value;
        return this;
    }

    verify() {
        if (!this.config.called)
            throw new TypeError("Expected call");
    }
}

class InternalConfig {
    constructor(private callstack: Activation[]) {

    }

    called: boolean = false;
    return: any;

    call(params: any[]): any {
        this.called = true;
        return this.return;
    }

    isMatch(candidate: Activation[]): boolean {
        if (candidate.length > this.callstack.length)
            return false;

        return candidate.every((c, i) => c.matches(this.callstack[i]));
    }

    isPerfectMatch(candidate: Activation[]): boolean {
        return this.isMatch(candidate) && candidate.length == this.callstack.length;
    }

    asPublic<TReturn>(): MockConfig<TReturn> {
        return new MockConfig<TReturn>(this);
    }
}

export function classify<TInterface>(): new () => TInterface {
    interface ctor {
        new(): TInterface
    }

    return {} as ctor;
}