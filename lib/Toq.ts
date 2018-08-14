import { ConfigurableObject } from "./ConfigurableObject";
import { InternalConfig } from "./InternalConfig";
import { MockConfig } from "./MockConfig";
import { ExpandoObject } from "./ExpandoObject";

export class Toq<TMock extends object> {
    private configs: InternalConfig[] = [];

    public setup<TReturn>(setup: (config: TMock) => TReturn | void): MockConfig<TReturn> {
        let configObject = new ConfigurableObject();
        setup(configObject.object);
        let oldMatches = this.configs.filter(x => x.isPerfectMatch(configObject.callStack));

        if (oldMatches.length)
            return oldMatches[0].asPublic<TReturn>();

        let config = new InternalConfig(configObject.callStack);
        this.configs.push(config);
        return config.asPublic<TReturn>();
    }

    public verify<TReturn>(verify: (config: TMock) => TReturn | void) : void {
        let configObject = new ConfigurableObject();
        verify(configObject.object);
        let matches = this.configs.filter(x =>
            x.isPerfectMatch(configObject.callStack) && 
            x.called
        );

        if (!matches.length)
            throw new TypeError("Expected call");
    }

    private _object: TMock;
    public get object(): TMock {
        return this._object || (this._object = ExpandoObject.buildMock<TMock>(this.configs));
    }
}
