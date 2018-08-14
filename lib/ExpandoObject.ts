import { InternalConfig } from "./InternalConfig";
import { Activation } from "./Activation";
import { ActivationType } from "./ActivationType";

export class ExpandoObject implements ProxyHandler<any> {
    private constructor(private configs: InternalConfig[], private callstack: Activation[] = []) {
    }

    get(target: any, prop: string | number | symbol) : any {
        let newStack = [...this.callstack, new Activation(ActivationType.PropertyGet, null, prop)];

        let done = this.configs.filter(x => x.isPerfectMatch(newStack));
        if (done.length)
            return done[0].call([]);

        if (!this.configs.some(x => x.isMatch(newStack)))
            throw new TypeError("Call was not set up");

        return new Proxy(() => {}, new ExpandoObject(this.configs, newStack));
    }

    set(target: any, prop: number | string | symbol, value: any) {
        let newStack = [...this.callstack, new Activation(ActivationType.PropetySet, [value], prop)];

        let done = this.configs.filter(x => x.isPerfectMatch(newStack));
        if (done.length) {
            done[0].call([value]);
            return true;
        }

        if (!this.configs.some(x => x.isMatch(newStack)))
            throw new TypeError("Call was not set up");

        return true;
    }

    apply(target: any, thisArg: any, argumentsList: any[]) : any {
        let newStack = [...this.callstack, new Activation(ActivationType.FunctionCall, [...argumentsList])];

        let done = this.configs.filter(x => x.isPerfectMatch(newStack));
        if (done.length)
            return done[0].call([...argumentsList]);

        if (!this.configs.some(x => x.isMatch(newStack)))
            throw new TypeError("Call was not set up");

        return new Proxy(() => {}, new ExpandoObject(this.configs, newStack));
    }

    public static buildMock<TMock>(configs: InternalConfig[]) : TMock {
        return new Proxy(() => {}, new ExpandoObject(configs));
    }
}
