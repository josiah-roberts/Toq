import { InternalConfig } from "./InternalConfig";

export class MockConfig<TReturn> {
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