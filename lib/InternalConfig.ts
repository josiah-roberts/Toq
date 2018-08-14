import { Activation } from "./Activation";
import { MockConfig } from "./MockConfig";

export class InternalConfig {
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
