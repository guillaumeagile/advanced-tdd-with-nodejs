import {AntiSpamPort} from "@domain/ports/anti-spam.port";
import {MockAntiSpamAdapter} from "@infrastructure/external-services/mock-anti-spam.adapter";


export class EmailWithoutSpam {
    private _antiSpamPort: AntiSpamPort;
    private _value: string;


    constructor(email: string, antiSpamPort: AntiSpamPort) {
        this._value = email.toLowerCase();
        this._antiSpamPort = antiSpamPort;
    }

    public isValid(): Promise<boolean> {
        return this._antiSpamPort.isBlocked(this._value);
    }

    public static async isValid(email: string): Promise< boolean> {
      throw new Error("Method not implemented.");
    }


    static async create(email: string, mockAdapter: AntiSpamPort) {
        return new EmailWithoutSpam(email, mockAdapter);
    }

    getValue() {
        return this._value;
    }
}