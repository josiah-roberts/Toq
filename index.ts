export * from './lib/Toq'
import {Toq} from './lib/Toq'

class Thing
{
    public stringyBoi: string;
    public anotherThing: Thing;
    public callMe(int: number, s: string): Thing {
        return new Thing();
    }
    public setMe: number;
}

var x = new Toq<Thing>();
let setup = x.setup(t => t.callMe(12, "corn").stringyBoi).returns("hey there");
x.setup(t => t.callMe(12, "corn").callMe(0, "cake")).returns(new Thing());
x.setup(t => t.callMe(12, "something else")).returns(null);
x.setup(t => t.setMe = 12);

let heyThere = x.object.callMe(12, "corn").stringyBoi;
let other = x.object.callMe(12, "something else");
let shouldBeAThing = x.object.callMe(12, "corn").callMe(0, "cake");
x.object.setMe = 12;

heyThere.toString();
x.verify(t => t.callMe(12, "corn").callMe(0, "cake"))
