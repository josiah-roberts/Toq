import { ActivationType } from "./ActivationType";

export class Activation {
    constructor(
        private type: ActivationType,
        private parameters?: Array<any>,
        private name?: string | number | symbol)
    {

    }

    public matches(b: Activation) {
        if (this.type != b.type)
            return false;

        if (this.name != b.name)
            return false;

        if ((this.parameters == null) != (b.parameters == null))
            return false;

        if (this.parameters == b.parameters)
            return true;

        if (!this.parameters.every((a, i) => a == b.parameters[i]))
            return false;

        return true;       
    }
}