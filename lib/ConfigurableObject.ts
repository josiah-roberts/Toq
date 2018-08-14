import { Activation } from "./Activation";
import { ActivationType } from "./ActivationType";

export class ConfigurableObject {
    public callStack: Activation[] = [];
    
    private _object: any;
    public get object() {
        return this._object || (this._object = this.buildObject());
    }

    private buildObject(): any {
        let handler: ProxyHandler<any> = {
            get: (target, prop) => {
                this.callStack.push(new Activation(ActivationType.PropertyGet, null, prop));
                return this.buildObject();
            },
            set: (target, prop, value) => {
                this.callStack.push(new Activation(ActivationType.PropetySet, [value], prop));
                return true;
            },
            apply: (target, thisArg, argumentsList) => {
                this.callStack.push(new Activation(ActivationType.FunctionCall, [...argumentsList]));
                return this.buildObject();
            }
        };
        return new Proxy(() => { }, handler);
    }
}
